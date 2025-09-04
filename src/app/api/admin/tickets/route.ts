import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwtUtils';
import sequelize, { authSequelize } from '@/lib/db';
import Ticket from '@/models/Ticket';
import TicketHistory from '@/models/TicketHistory';
import User from '@/models/User';
import { QueryTypes } from 'sequelize';

async function getRoleAndPermissions(userId: string): Promise<{ roleName: string; roleId: number | null; permissions: string[] }>{
  try {
    const userRow: any = await authSequelize.query(
      `SELECT u.ROLE_ID, r.NAME as ROLE_NAME
       FROM CGBRITO.USERS u
       JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
       WHERE u.ID = :userId AND u.STATUS = 'active'`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    const row = Array.isArray(userRow) ? (userRow.length > 0 ? userRow[0] : null) : userRow;
    if (!row) return { roleName: '', roleId: null, permissions: [] };
    const roleId = row.ROLE_ID;
    const roleName = (row.ROLE_NAME || '').toString().toUpperCase();
    const permsRows: any = await authSequelize.query(
      `SELECT p.NAME FROM CGBRITO.PERMISSIONS p
       JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
       WHERE rp.ROLE_ID = :roleId`,
      { replacements: { roleId }, type: QueryTypes.SELECT }
    );
    const permissions = (Array.isArray(permsRows) ? permsRows : [permsRows])
      .map((r: any) => r.NAME || r.name)
      .filter(Boolean);
    return { roleName, roleId, permissions };
  } catch {
    return { roleName: '', roleId: null, permissions: [] };
  }
}

// GET - Obtener todos los tickets con información relacionada
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
    }
    
    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }

    // Cargar permisos del rol
    const { roleName, permissions } = await getRoleAndPermissions(tokenPayload.id);
    const isAdmin = roleName === 'ADMIN';
    const canRead = isAdmin || permissions.includes('tickets.read');
    if (!canRead) return NextResponse.json({ error: 'Sin permiso para listar tickets' }, { status: 403 });

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const prioridad = searchParams.get('prioridad');
    const ejecutivo = searchParams.get('ejecutivo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Construir consulta base
    let whereClause = '1=1';
    const replacements: Record<string, any> = {};

    if (estado && estado !== 'todos') {
      whereClause += ' AND t.ESTADO = :estado';
      replacements.estado = estado;
    }

    if (prioridad && prioridad !== 'todos') {
      whereClause += ' AND t.PRIORIDAD = :prioridad';
      replacements.prioridad = prioridad;
    }

    if (ejecutivo && ejecutivo !== 'todos') {
      whereClause += ' AND t.EJECUTIVO_ID = :ejecutivo';
      replacements.ejecutivo = ejecutivo;
    }

    // Consulta principal con JOINs
    const query = `
      SELECT 
        t.ID,
        t.ASUNTO,
        t.CONCEPTO,
        t.ESTADO,
        t.PRIORIDAD,
        t.FECHA_CREACION,
        t.FECHA_LIMITE,
        t.FECHA_COMPLETADO,
        t.EJECUTIVO_ID,
        t.CREADO_POR,
        t.OBSERVACIONES,
        t.CREATED_AT,
        t.UPDATED_AT,
        c.USERNAME as creador_username,
        c.FIRST_NAME || ' ' || c.LAST_NAME as creador_nombre,
        e.USERNAME as ejecutivo_username,
        e.FIRST_NAME || ' ' || e.LAST_NAME as ejecutivo_nombre
      FROM TICKETS t
      LEFT JOIN USERS c ON t.CREADO_POR = c.ID
      LEFT JOIN USERS e ON t.EJECUTIVO_ID = e.ID
      WHERE ${whereClause}
      ORDER BY 
        CASE t.PRIORIDAD 
          WHEN 'Crítica' THEN 1 
          WHEN 'Alta' THEN 2 
          WHEN 'Media' THEN 3 
          WHEN 'Baja' THEN 4 
        END,
        t.FECHA_CREACION DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    // Consulta de conteo total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM TICKETS t
      WHERE ${whereClause}
    `;

    // Ejecutar consultas
    replacements.offset = offset;
    replacements.limit = limit;

    const [ticketsResult, countResult] = await Promise.all([
      sequelize.query(query, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(countQuery, { replacements, type: QueryTypes.SELECT })
    ]);

    const tickets = ticketsResult as any[];
    const total = (Array.isArray(countResult) ? (countResult[0] as any)?.TOTAL : 0) || 0;

    // Formatear fechas y datos
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.ID,
      asunto: ticket.ASUNTO,
      concepto: ticket.CONCEPTO,
      estado: ticket.ESTADO,
      prioridad: ticket.PRIORIDAD,
      fecha_creacion: ticket.FECHA_CREACION,
      fecha_limite: ticket.FECHA_LIMITE,
      fecha_completado: ticket.FECHA_COMPLETADO,
      ejecutivo_id: ticket.EJECUTIVO_ID,
      creado_por: ticket.CREADO_POR,
      observaciones: ticket.OBSERVACIONES,
      created_at: ticket.CREATED_AT,
      updated_at: ticket.UPDATED_AT,
      creador: {
        username: ticket.CREADOR_USERNAME,
        nombre: ticket.CREADOR_NOMBRE
      },
      ejecutivo: ticket.EJECUTIVO_USERNAME ? {
        username: ticket.EJECUTIVO_USERNAME,
        nombre: ticket.EJECUTIVO_NOMBRE
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: formattedTickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo ticket
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
    }
    
    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }

    // Cargar permisos del rol
    const { roleName, permissions } = await getRoleAndPermissions(tokenPayload.id);
    const isAdmin = roleName === 'ADMIN';
    const canCreate = isAdmin || permissions.includes('tickets.create') || permissions.includes('tickets.manage');
    if (!canCreate) return NextResponse.json({ error: 'Sin permiso para crear tickets' }, { status: 403 });

    const body = await request.json();
    const { asunto, concepto, estado, prioridad, fecha_limite, ejecutivo_id, observaciones } = body;

    // Validaciones básicas
    if (!asunto || !concepto) {
      return NextResponse.json(
        { error: 'Asunto y concepto son obligatorios' },
        { status: 400 }
      );
    }

    // Crear ticket
    const ticket = await Ticket.create({
      asunto,
      concepto,
      estado: estado || 'Pendiente',
      prioridad: prioridad || 'Media',
      fecha_limite: fecha_limite ? new Date(fecha_limite) : null,
      ejecutivo_id: ejecutivo_id || null,
      creado_por: tokenPayload.id,
      observaciones: observaciones || null
    });

    // Crear registro en historial
    await TicketHistory.create({
      ticket_id: ticket.id,
      campo_cambiado: 'Ticket Creado',
      valor_anterior: null,
      valor_nuevo: `Ticket "${asunto}" creado`,
      usuario_id: tokenPayload.id
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Ticket creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando ticket:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
