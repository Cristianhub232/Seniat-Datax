import { NextRequest, NextResponse } from 'next/server';
import sequelize from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');

    let whereClause = '';
    const params: any[] = [];

    if (tipo) {
      whereClause += ' AND TIPO_IMPUESTO = :tipo';
      params.push(tipo);
    }

    if (estado) {
      whereClause += ' AND ESTADO = :estado';
      params.push(estado);
    }

    // Obtener obligaciones próximas (próximos 30 días)
    const obligacionesQuery = `
      SELECT ID, CODIGO_OBLIGACION, TIPO_IMPUESTO, DESCRIPCION, 
             TO_CHAR(FECHA_LIMITE, 'DD/MM/YYYY') as FECHA_LIMITE,
             PERIODO_FISCAL, TIPO_CONTRIBUYENTE, TERMINAL_RIF, 
             PRIORIDAD, ESTADO, OBSERVACIONES
      FROM OBLIGACIONES_TRIBUTARIAS 
      WHERE FECHA_LIMITE BETWEEN SYSDATE AND SYSDATE + 30
      ${whereClause}
      ORDER BY FECHA_LIMITE ASC
      FETCH FIRST ${limit} ROWS ONLY
    `;

    const obligacionesResult = await sequelize.query(obligacionesQuery, {
      replacements: params
    });

    // Obtener estadísticas adicionales
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN FECHA_LIMITE < SYSDATE AND ESTADO = 'PENDIENTE' THEN 1 ELSE 0 END) as vencidas,
        SUM(CASE WHEN FECHA_LIMITE BETWEEN SYSDATE AND SYSDATE + 7 AND ESTADO = 'PENDIENTE' THEN 1 ELSE 0 END) as esta_semana,
        SUM(CASE WHEN ESTADO = 'CUMPLIDA' THEN 1 ELSE 0 END) as cumplidas
      FROM OBLIGACIONES_TRIBUTARIAS
    `;

    const statsResult = await sequelize.query(statsQuery);

    return NextResponse.json({
      success: true,
      data: {
        obligaciones: obligacionesResult,
        estadisticas: statsResult[0]
      }
    });

  } catch (error) {
    console.error('Error obteniendo obligaciones:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        data: {
          obligaciones: [],
          estadisticas: {
            total: 0,
            vencidas: 0,
            esta_semana: 0,
            cumplidas: 0
          }
        }
      },
      { status: 500 }
    );
  }
} 