import { NextRequest, NextResponse } from 'next/server';
// import { xmlsSequelize } from '@/lib/db';
// import EmpresaPetrolera from '@/models/EmpresaPetrolera';
// import Forma from '@/models/Forma';
// import CodigoPresupuestario from '@/models/CodigoPresupuestario';
// import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Obtener estadísticas de empresas petroleras
    const empresasCount = 0; // await EmpresaPetrolera.count();
    
    // Obtener estadísticas de formas
    const formasCount = 0; // await Forma.count();
    
    // Obtener estadísticas de códigos presupuestarios
    const codigosCount = 0; // await CodigoPresupuestario.count();
    
    // Obtener estadísticas de usuarios
    const usuariosCount = 0; // await User.count();
    
    // Obtener estadísticas de formas no validadas
    const formasNoValidadasStats = [{ total_formas_no_validadas: 0, total_monto_no_validadas: 0 }];
    // const [formasNoValidadasStats] = await xmlsSequelize.query(`
    //   SELECT 
    //     COUNT(*) as total_formas_no_validadas,
    //     COALESCE(SUM(monto_total_trans), 0) as total_monto_no_validadas
    //   FROM datalake.formas_no_validadas_mv
    // `);
    
    // Obtener estadísticas de planillas de recaudación
    const planillasStats = [{ total_planillas: 0, total_monto_planillas: 0 }];
    // const [planillasStats] = await xmlsSequelize.query(`
    //   SELECT 
    //     COUNT(*) as total_planillas,
    //     COALESCE(SUM(monto_total_trans), 0) as total_monto_planillas
    //   FROM datalake.planillas_recaudacion_2024_mv
    //   WHERE registro = true
    // `);
    
    // Obtener estadísticas de bancos
    const bancosStats = [{ total_bancos: 0 }];
    // const [bancosStats] = await xmlsSequelize.query(`
    //   SELECT COUNT(*) as total_bancos
    //   FROM public.bancos
    // `);
    
    // Obtener estadísticas de reportes de cierre
    const reportesStats = [{ total_conceptos: 0, total_monto_conceptos: 0 }];
    // const [reportesStats] = await xmlsSequelize.query(`
    //   SELECT 
    //     COUNT(*) as total_conceptos,
    //     COALESCE(SUM(total_monto), 0) as total_monto_conceptos
    //   FROM datalake.reportes_cierre_mv
    // `);
    
    // Obtener distribución por mes (últimos 6 meses)
    const distribucionMensual = [];
    // const [distribucionMensual] = await xmlsSequelize.query(`
    //   SELECT 
    //     EXTRACT(MONTH FROM fecha_trans) as mes,
    //     COUNT(*) as cantidad_planillas,
    //     COALESCE(SUM(monto_total_trans), 0) as monto_total
    //   FROM datalake.planillas_recaudacion_2024_mv
    //   WHERE registro = true 
    //     AND fecha_trans >= CURRENT_DATE - INTERVAL '6 months'
    //   GROUP BY EXTRACT(MONTH FROM fecha_trans)
    //   ORDER BY mes ASC
    // `);
    
    // Obtener top 5 formas más utilizadas
    const topFormas = [];
    // const [topFormas] = await xmlsSequelize.query(`
    //   SELECT 
    //     codigo_forma,
    //     nombre_forma,
    //     COUNT(*) as cantidad_planillas,
    //     COALESCE(SUM(monto_total_trans), 0) as monto_total
    //   FROM datalake.planillas_recaudacion_2024_mv
    //   WHERE registro = true
    //   GROUP BY codigo_forma, nombre_forma
    //   ORDER BY cantidad_planillas DESC
    //   LIMIT 5
    // `);

    const stats = {
      empresas_petroleras: empresasCount,
      formas_presupuestarias: formasCount,
      codigos_presupuestarios: codigosCount,
      usuarios: usuariosCount,
      bancos: (bancosStats[0] as any).total_bancos,
      formas_no_validadas: (formasNoValidadasStats[0] as any).total_formas_no_validadas,
      total_monto_formas_no_validadas: parseFloat((formasNoValidadasStats[0] as any).total_monto_no_validadas || 0),
      planillas_recaudacion: (planillasStats[0] as any).total_planillas,
      total_monto_planillas: parseFloat((planillasStats[0] as any).total_monto_planillas || 0),
      total_conceptos: (reportesStats[0] as any).total_conceptos,
      total_monto_conceptos: parseFloat((reportesStats[0] as any).total_monto_conceptos || 0),
      distribucion_mensual: distribucionMensual,
      top_formas: topFormas
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error obteniendo estadísticas del dashboard',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 