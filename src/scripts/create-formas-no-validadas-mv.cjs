const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos XMLS
const xmlsSequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function createFormasNoValidadasMaterializedView() {
  try {
    console.log('🔍 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Crear vista materializada para formas no validadas
    console.log('\n📊 Creando vista materializada para formas no validadas...');
    
    const createMVQuery = `
      CREATE MATERIALIZED VIEW IF NOT EXISTS datalake.formas_no_validadas_mv AS
      SELECT 
        pr.rif_contribuyente,
        pr.num_planilla,
        pr.monto_total_trans,
        f.codigo_forma,
        f.nombre_forma,
        pr.id as planilla_id
      FROM datalake.planillas_recaudacion_2024 pr 
      INNER JOIN public.formas f ON pr.cod_forma = f.id
      WHERE pr.registro = false
      ORDER BY pr.monto_total_trans DESC
    `;

    await xmlsSequelize.query(createMVQuery);
    console.log('✅ Vista materializada creada exitosamente');

    // Crear índices para mejorar el rendimiento
    console.log('\n🔍 Creando índices para optimizar rendimiento...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_formas_no_validadas_mv_codigo ON datalake.formas_no_validadas_mv(codigo_forma)',
      'CREATE INDEX IF NOT EXISTS idx_formas_no_validadas_mv_monto ON datalake.formas_no_validadas_mv(monto_total_trans DESC)',
      'CREATE INDEX IF NOT EXISTS idx_formas_no_validadas_mv_rif ON datalake.formas_no_validadas_mv(rif_contribuyente)',
      'CREATE INDEX IF NOT EXISTS idx_formas_no_validadas_mv_planilla ON datalake.formas_no_validadas_mv(num_planilla)'
    ];

    for (const indexQuery of indexes) {
      await xmlsSequelize.query(indexQuery);
    }
    console.log('✅ Índices creados exitosamente');

    // Verificar la vista materializada
    console.log('\n📊 Verificando vista materializada...');
    const [mvData] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT codigo_forma) as formas_unicas,
        SUM(monto_total_trans) as monto_total,
        AVG(monto_total_trans) as monto_promedio
      FROM datalake.formas_no_validadas_mv
    `);

    console.log('📈 Datos de la vista materializada:');
    console.log(`   • Total registros: ${mvData[0].total_registros.toLocaleString()}`);
    console.log(`   • Formas únicas: ${mvData[0].formas_unicas}`);
    console.log(`   • Monto total: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(mvData[0].monto_total)}`);
    console.log(`   • Monto promedio: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(mvData[0].monto_promedio)}`);

    // Obtener top 5 formas no validadas
    const [topFormas] = await xmlsSequelize.query(`
      SELECT 
        codigo_forma,
        nombre_forma,
        COUNT(*) as cantidad_planillas,
        SUM(monto_total_trans) as monto_total
      FROM datalake.formas_no_validadas_mv
      GROUP BY codigo_forma, nombre_forma
      ORDER BY monto_total DESC
      LIMIT 5
    `);

    console.log('\n📊 Top 5 formas no validadas:');
    topFormas.forEach((forma, index) => {
      console.log(`${index + 1}. ${forma.nombre_forma} (${forma.codigo_forma})`);
      console.log(`   • Planillas: ${forma.cantidad_planillas.toLocaleString()}`);
      console.log(`   • Monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(forma.monto_total)}`);
    });

    // Verificar rendimiento
    console.log('\n⚡ Probando rendimiento...');
    const startTime = Date.now();
    
    const [performanceTest] = await xmlsSequelize.query(`
      SELECT 
        codigo_forma,
        nombre_forma,
        COUNT(*) as cantidad_planillas,
        SUM(monto_total_trans) as monto_total
      FROM datalake.formas_no_validadas_mv
      GROUP BY codigo_forma, nombre_forma
      ORDER BY monto_total DESC
      LIMIT 10
    `);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    console.log(`🚀 Tiempo de ejecución: ${executionTime}ms`);
    console.log(`📊 Registros procesados: ${performanceTest.length}`);
    console.log('✅ Vista materializada funcionando correctamente');

    console.log('\n🎯 Beneficios de la vista materializada:');
    console.log('   • Consultas rápidas para formas no validadas');
    console.log('   • Datos pre-agregados y optimizados');
    console.log('   • Mejor rendimiento en reportes');
    console.log('   • Análisis eficiente de datos no validados');

  } catch (error) {
    console.error('❌ Error durante la creación de la vista materializada:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

createFormasNoValidadasMaterializedView(); 