import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwtUtils';
import sequelize from '@/lib/db';
import Ticket from '@/models/Ticket';
import TicketHistory from '@/models/TicketHistory';
import User from '@/models/User';

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

    // Verificar rol de administrador
    if (tokenPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 });
    }

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
    const params: any[] = [];

    if (estado && estado !== 'todos') {
      whereClause += ' AND t.estado = :estado';
      params.push(estado);
    }

    if (prioridad && prioridad !== 'todos') {
      whereClause += ' AND t.prioridad = :prioridad';
      params.push(prioridad);
    }

    if (ejecutivo && ejecutivo !== 'todos') {
      whereClause += ' AND t.ejecutivo_id = :ejecutivo';
      params.push(parseInt(ejecutivo));
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
    const [ticketsResult, countResult] = await Promise.all([
      sequelize.query(query, {
        bind: [...params, offset, limit]
      }),
      sequelize.query(countQuery, {
        bind: params
      })
    ]);

    const tickets = ticketsResult[0] as any[];
    const total = (countResult[0] as any[])[0]?.TOTAL || 0;

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

    // Verificar rol de administrador
    if (tokenPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 });
    }

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
      creado_por: parseInt(tokenPayload.id),
      observaciones: observaciones || null
    });

    // Crear registro en historial
    await TicketHistory.create({
      ticket_id: ticket.id,
      campo_cambiado: 'Ticket Creado',
      valor_anterior: null,
      valor_nuevo: `Ticket "${asunto}" creado`,
      usuario_id: parseInt(tokenPayload.id)
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
