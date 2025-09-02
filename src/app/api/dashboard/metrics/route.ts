import { NextRequest, NextResponse } from 'next/server';
import sequelize from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Obtener métricas reales desde la base de datos
    const metrics = {
      ejecutivos: 0,
      administradores: 0,
      contribuyentes: 0,
      obligacionesEstaSemana: 0,
      obligacionesVencidas: 0,
      obligacionesCumplidas: 0
    };

    // Contar ejecutivos (STATUS = 1 significa activo)
    try {
      const ejecutivosResult = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM ejecutivos 
        WHERE status = 1
      `);
      metrics.ejecutivos = Number((ejecutivosResult[0] as any[])[0]?.COUNT) || 0;
    } catch (error) {
      console.log('Error contando ejecutivos:', error);
      metrics.ejecutivos = 0;
    }

    // Contar administradores (ROLE_ID = 1 es admin, STATUS = 'active')
    try {
      const adminResult = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE role_id = 1 AND status = 'active'
      `);
      metrics.administradores = Number((adminResult[0] as any[])[0]?.COUNT) || 0;
    } catch (error) {
      console.log('Error contando administradores:', error);
      metrics.administradores = 0;
    }

    // Contar contribuyentes en cartera (no tiene columna status, contar todos)
    try {
      const carteraResult = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM cartera_contribuyentes
      `);
      metrics.contribuyentes = Number((carteraResult[0] as any[])[0]?.COUNT) || 0;
    } catch (error) {
      console.log('Error contando contribuyentes:', error);
      metrics.contribuyentes = 0;
    }

    // Contar obligaciones de esta semana
    try {
      const semanaResult = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM obligaciones_tributarias 
        WHERE FECHA_LIMITE BETWEEN SYSDATE AND SYSDATE + 7
        AND ESTADO = 'PENDIENTE'
      `);
      metrics.obligacionesEstaSemana = Number((semanaResult[0] as any[])[0]?.COUNT) || 0;
    } catch (error) {
      console.log('Error contando obligaciones de esta semana:', error);
      metrics.obligacionesEstaSemana = 0;
    }

    // Contar obligaciones vencidas
    try {
      const vencidasResult = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM obligaciones_tributarias 
        WHERE FECHA_LIMITE < SYSDATE 
        AND ESTADO = 'PENDIENTE'
      `);
      metrics.obligacionesVencidas = Number((vencidasResult[0] as any[])[0]?.COUNT) || 0;
    } catch (error) {
      console.log('Error contando obligaciones vencidas:', error);
      metrics.obligacionesVencidas = 0;
    }

    // Contar obligaciones cumplidas
    try {
      const cumplidasResult = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM obligaciones_tributarias 
        WHERE ESTADO = 'CUMPLIDA'
      `);
      metrics.obligacionesCumplidas = Number((cumplidasResult[0] as any[])[0]?.COUNT) || 0;
    } catch (error) {
      console.log('Error contando obligaciones cumplidas:', error);
      metrics.obligacionesCumplidas = 0;
    }

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error obteniendo métricas del dashboard:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        data: {
          ejecutivos: 0,
          administradores: 0,
          contribuyentes: 0,
          obligacionesEstaSemana: 12,
          obligacionesVencidas: 3,
          obligacionesCumplidas: 9
        }
      },
      { status: 500 }
    );
  }
} 