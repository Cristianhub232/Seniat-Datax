import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwtUtils';
import sequelize, { authSequelize } from '@/lib/db';
import { QueryTypes } from 'sequelize';

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

    // Cargar rol/permiso
    const roleRows: any = await authSequelize.query(
      `SELECT u.ROLE_ID, r.NAME as ROLE_NAME
       FROM CGBRITO.USERS u
       JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
       WHERE u.ID = :userId AND u.STATUS = 'active'`,
      { replacements: { userId: tokenPayload.id }, type: QueryTypes.SELECT }
    );
    const roleRow = Array.isArray(roleRows) ? (roleRows.length > 0 ? roleRows[0] : null) : roleRows;
    const roleName = ((roleRow?.ROLE_NAME || '') as string).toUpperCase();
    if (!(roleName === 'ADMIN')) {
      return NextResponse.json({ error: 'Sin permiso para ver estadísticas' }, { status: 403 });
    }

    // Consulta para estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'En Proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'Completado' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN estado = 'Cancelado' THEN 1 ELSE 0 END) as cancelados,
        SUM(CASE WHEN prioridad = 'Crítica' THEN 1 ELSE 0 END) as prioridad_critica,
        SUM(CASE WHEN prioridad = 'Alta' THEN 1 ELSE 0 END) as prioridad_alta,
        SUM(CASE WHEN prioridad = 'Media' THEN 1 ELSE 0 END) as prioridad_media,
        SUM(CASE WHEN prioridad = 'Baja' THEN 1 ELSE 0 END) as prioridad_baja,
        SUM(CASE WHEN fecha_limite < CURRENT_TIMESTAMP AND estado NOT IN ('Completado', 'Cancelado') THEN 1 ELSE 0 END) as vencidos
      FROM TICKETS
    `;

    // Consulta para tickets por ejecutivo
    // Resolver dinámicamente ROLE_ID de EJECUTIVO
    const roleEjRows: any = await authSequelize.query(
      `SELECT ID FROM CGBRITO.ROLES WHERE UPPER(NAME) = 'EJECUTIVO'`,
      { type: QueryTypes.SELECT }
    );
    const ejecutivoRoleId = Array.isArray(roleEjRows) && roleEjRows.length ? roleEjRows[0].ID : null;

    const ejecutivosQuery = `
      SELECT 
        u.ID,
        u.USERNAME,
        u.FIRST_NAME || ' ' || u.LAST_NAME as NOMBRE,
        COUNT(t.ID) as total_tickets,
        SUM(CASE WHEN t.estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN t.estado = 'En Proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN t.estado = 'Completado' THEN 1 ELSE 0 END) as completados
      FROM USERS u
      LEFT JOIN TICKETS t ON u.ID = t.EJECUTIVO_ID
      ${ejecutivoRoleId ? 'WHERE u.ROLE_ID = ' + ejecutivoRoleId : ''}
      GROUP BY u.ID, u.USERNAME, u.FIRST_NAME, u.LAST_NAME
      ORDER BY total_tickets DESC
    `;

    // Consulta para tickets de la semana
    const semanaQuery = `
      SELECT 
        COUNT(*) as tickets_semana,
        SUM(CASE WHEN estado = 'Completado' THEN 1 ELSE 0 END) as completados_semana,
        SUM(CASE WHEN fecha_limite < CURRENT_TIMESTAMP AND estado NOT IN ('Completado', 'Cancelado') THEN 1 ELSE 0 END) as vencidos_semana
      FROM TICKETS
      WHERE fecha_creacion >= TRUNC(SYSDATE, 'IW')
    `;

    // Consulta para tickets por mes (últimos 6 meses)
    const mesesQuery = `
      SELECT 
        TO_CHAR(fecha_creacion, 'YYYY-MM') as mes,
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'Completado' THEN 1 ELSE 0 END) as completados
      FROM TICKETS
      WHERE fecha_creacion >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -5)
      GROUP BY TO_CHAR(fecha_creacion, 'YYYY-MM')
      ORDER BY mes
    `;

    // Ejecutar todas las consultas
    const [statsResult, ejecutivosResult, semanaResult, mesesResult] = await Promise.all([
      sequelize.query(statsQuery),
      sequelize.query(ejecutivosQuery),
      sequelize.query(semanaQuery),
      sequelize.query(mesesQuery)
    ]);

    const stats = (statsResult[0] as any[])[0];
    const ejecutivos = ejecutivosResult[0] as any[];
    const semana = (semanaResult[0] as any[])[0];
    const meses = mesesResult[0] as any[];

    // Formatear estadísticas
    const estadisticas = {
      generales: {
        total: stats.TOTAL_TICKETS || 0,
        pendientes: stats.PENDIENTES || 0,
        en_proceso: stats.EN_PROCESO || 0,
        completados: stats.COMPLETADOS || 0,
        cancelados: stats.CANCELADOS || 0,
        vencidos: stats.VENCIDOS || 0
      },
      prioridades: {
        critica: stats.PRIORIDAD_CRITICA || 0,
        alta: stats.PRIORIDAD_ALTA || 0,
        media: stats.PRIORIDAD_MEDIA || 0,
        baja: stats.PRIORIDAD_BAJA || 0
      },
      semana: {
        total: semana.TICKETS_SEMANA || 0,
        completados: semana.COMPLETADOS_SEMANA || 0,
        vencidos: semana.VENCIDOS_SEMANA || 0
      },
      ejecutivos: ejecutivos.map(ej => ({
        id: ej.ID,
        username: ej.USERNAME,
        nombre: ej.NOMBRE,
        total: ej.TOTAL_TICKETS || 0,
        pendientes: ej.PENDIENTES || 0,
        en_proceso: ej.EN_PROCESO || 0,
        completados: ej.COMPLETADOS || 0
      })),
      tendencias: meses.map(mes => ({
        mes: mes.MES,
        total: mes.TOTAL || 0,
        completados: mes.COMPLETADOS || 0
      }))
    };

    return NextResponse.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de tickets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
