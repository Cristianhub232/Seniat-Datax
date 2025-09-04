import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwtUtils';
import sequelize, { authSequelize } from '@/lib/db';
import Ticket from '@/models/Ticket';
import TicketHistory from '@/models/TicketHistory';
import { QueryTypes } from 'sequelize';

async function getRoleAndPermissions(userId: string): Promise<{ roleName: string; roleId: number | null; permissions: string[] }>{
  try {
    const rows: any = await authSequelize.query(
      `SELECT u.ROLE_ID, r.NAME as ROLE_NAME
       FROM CGBRITO.USERS u
       JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
       WHERE u.ID = :userId AND u.STATUS = 'active'`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    const row = Array.isArray(rows) ? (rows.length > 0 ? rows[0] : null) : rows;
    if (!row) return { roleName: '', roleId: null, permissions: [] };
    const roleId = row.ROLE_ID;
    const roleName = (row.ROLE_NAME || '').toString().toUpperCase();
    const perms: any = await authSequelize.query(
      `SELECT p.NAME FROM CGBRITO.PERMISSIONS p
       JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
       WHERE rp.ROLE_ID = :roleId`,
      { replacements: { roleId }, type: QueryTypes.SELECT }
    );
    const permissions = (Array.isArray(perms) ? perms : [perms]).map((r: any) => r.NAME || r.name).filter(Boolean);
    return { roleName, roleId, permissions };
  } catch {
    return { roleName: '', roleId: null, permissions: [] };
  }
}

export async function GET(request: NextRequest, { params }: any) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  const tokenPayload = verifyToken(token) as any;
  if (!tokenPayload) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

  const { roleName, permissions } = await getRoleAndPermissions(tokenPayload.id);
  const isAdmin = roleName === 'ADMIN';
  if (!(isAdmin || permissions.includes('tickets.read'))) {
    return NextResponse.json({ error: 'Sin permiso para ver tickets' }, { status: 403 });
  }

  const id = parseInt(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const [ticketRows, historyRows] = await Promise.all([
    sequelize.query(
      `SELECT t.*, c.USERNAME as CREADOR_USERNAME, c.FIRST_NAME || ' ' || c.LAST_NAME as CREADOR_NOMBRE,
              e.USERNAME as EJECUTIVO_USERNAME, e.FIRST_NAME || ' ' || e.LAST_NAME as EJECUTIVO_NOMBRE
       FROM TICKETS t
       LEFT JOIN USERS c ON t.CREADO_POR = c.ID
       LEFT JOIN USERS e ON t.EJECUTIVO_ID = e.ID
       WHERE t.ID = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    ),
    sequelize.query(
      `SELECT * FROM TICKET_HISTORY WHERE TICKET_ID = :id ORDER BY FECHA_CAMBIO DESC`,
      { replacements: { id }, type: QueryTypes.SELECT }
    )
  ]);

  const ticket = Array.isArray(ticketRows) ? ticketRows[0] : ticketRows;
  if (!ticket) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json({ ticket, history: historyRows });
}

export async function PUT(request: NextRequest, { params }: any) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  const tokenPayload = verifyToken(token) as any;
  if (!tokenPayload) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

  const { roleName, permissions } = await getRoleAndPermissions(tokenPayload.id);
  const isAdmin = roleName === 'ADMIN';
  const canManage = isAdmin || permissions.includes('tickets.manage');
  if (!canManage) return NextResponse.json({ error: 'Sin permiso para actualizar tickets' }, { status: 403 });

  const id = parseInt(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const body = await request.json();
  const {
    estado,
    prioridad,
    fecha_limite,
    ejecutivo_id,
    observaciones,
    asunto,
    concepto
  } = body as Partial<{
    estado: string;
    prioridad: string;
    fecha_limite: string | null;
    ejecutivo_id: string | null;
    observaciones: string | null;
    asunto: string;
    concepto: string;
  }>;

  // Leer previo completo
  const prevRows: any = await sequelize.query(
    `SELECT ASUNTO, CONCEPTO, ESTADO, PRIORIDAD, FECHA_LIMITE, EJECUTIVO_ID, OBSERVACIONES FROM TICKETS WHERE ID = :id`,
    { replacements: { id }, type: QueryTypes.SELECT }
  );
  const prev = Array.isArray(prevRows) && prevRows.length ? prevRows[0] : null;
  if (!prev) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  // Construir SET dinámico
  const setParts: string[] = [];
  const replacements: Record<string, any> = { id };
  const changes: Array<{ campo: string; anterior: any; nuevo: any }> = [];

  if (typeof asunto === 'string' && asunto !== prev.ASUNTO) {
    setParts.push('ASUNTO = :asunto');
    replacements.asunto = asunto;
    changes.push({ campo: 'ASUNTO', anterior: prev.ASUNTO, nuevo: asunto });
  }
  if (typeof concepto === 'string' && concepto !== prev.CONCEPTO) {
    setParts.push('CONCEPTO = :concepto');
    replacements.concepto = concepto;
    changes.push({ campo: 'CONCEPTO', anterior: prev.CONCEPTO, nuevo: concepto });
  }
  if (typeof estado === 'string' && estado !== prev.ESTADO) {
    setParts.push('ESTADO = :estado');
    replacements.estado = estado;
    changes.push({ campo: 'ESTADO', anterior: prev.ESTADO, nuevo: estado });
  }
  if (typeof prioridad === 'string' && prioridad !== prev.PRIORIDAD) {
    setParts.push('PRIORIDAD = :prioridad');
    replacements.prioridad = prioridad;
    changes.push({ campo: 'PRIORIDAD', anterior: prev.PRIORIDAD, nuevo: prioridad });
  }
  if (typeof ejecutivo_id !== 'undefined' && ejecutivo_id !== prev.EJECUTIVO_ID) {
    setParts.push('EJECUTIVO_ID = :ejecutivo_id');
    replacements.ejecutivo_id = ejecutivo_id;
    changes.push({ campo: 'EJECUTIVO_ID', anterior: prev.EJECUTIVO_ID, nuevo: ejecutivo_id });
  }
  if (typeof observaciones !== 'undefined' && observaciones !== prev.OBSERVACIONES) {
    setParts.push('OBSERVACIONES = :observaciones');
    replacements.observaciones = observaciones;
    changes.push({ campo: 'OBSERVACIONES', anterior: prev.OBSERVACIONES, nuevo: observaciones });
  }
  if (typeof fecha_limite !== 'undefined') {
    const prevDate = prev.FECHA_LIMITE ? new Date(prev.FECHA_LIMITE).toISOString() : null;
    const newDateIso = fecha_limite ? new Date(fecha_limite).toISOString() : null;
    if (prevDate !== newDateIso) {
      setParts.push('FECHA_LIMITE = :fecha_limite');
      replacements.fecha_limite = fecha_limite ? new Date(fecha_limite) : null;
      changes.push({ campo: 'FECHA_LIMITE', anterior: prevDate, nuevo: newDateIso });
    }
  }

  if (setParts.length === 0) {
    return NextResponse.json({ success: true, message: 'Sin cambios' });
  }

  const updateSql = `UPDATE TICKETS SET ${setParts.join(', ')}, UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = :id`;
  await sequelize.query(updateSql, { replacements, type: QueryTypes.UPDATE });

  // Registrar historial por cada cambio
  for (const change of changes) {
    await TicketHistory.create({
      ticket_id: id,
      campo_cambiado: change.campo,
      valor_anterior: change.anterior === null || typeof change.anterior === 'undefined' ? null : String(change.anterior),
      valor_nuevo: change.nuevo === null || typeof change.nuevo === 'undefined' ? null : String(change.nuevo),
      usuario_id: tokenPayload.id
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: any) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
  const tokenPayload = verifyToken(token) as any;
  if (!tokenPayload) return NextResponse.json({ error: 'Token inválido' }, { status: 403 });

  const { roleName, permissions } = await getRoleAndPermissions(tokenPayload.id);
  const isAdmin = roleName === 'ADMIN';
  const canManage = isAdmin || permissions.includes('tickets.manage');
  if (!canManage) return NextResponse.json({ error: 'Sin permiso para eliminar tickets' }, { status: 403 });

  const id = parseInt(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  await sequelize.query(`DELETE FROM TICKETS WHERE ID = :id`, { replacements: { id }, type: QueryTypes.DELETE });
  await TicketHistory.create({
    ticket_id: id,
    campo_cambiado: 'ELIMINADO',
    valor_anterior: null,
    valor_nuevo: null,
    usuario_id: tokenPayload.id
  });

  return NextResponse.json({ success: true });
}
