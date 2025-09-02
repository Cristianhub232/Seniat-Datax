const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos XMLS
const xmlsSequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function testRefreshMaterializedView() {
  try {
    console.log('🔍 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar estado actual de la vista materializada
    console.log('\n📊 Verificando estado actual de la vista materializada...');
    const [currentStats] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        MIN(fecha_trans) as fecha_minima,
        MAX(fecha_trans) as fecha_maxima,
        COUNT(DISTINCT codigo_presupuestario) as codigos_unicos
      FROM datalake.reportes_cierre_mv
    `);

    console.log('📈 Estado actual:');
    console.log(`   • Total registros: ${currentStats[0].total_registros.toLocaleString()}`);
    console.log(`   • Fecha mínima: ${currentStats[0].fecha_minima}`);
    console.log(`   • Fecha máxima: ${currentStats[0].fecha_maxima}`);
    console.log(`   • Códigos únicos: ${currentStats[0].codigos_unicos}`);

    // Simular actualización de la vista materializada
    console.log('\n🔄 Iniciando actualización de la vista materializada...');
    const startTime = Date.now();

    // Refrescar la vista materializada
    await xmlsSequelize.query('REFRESH MATERIALIZED VIEW CONCURRENTLY datalake.reportes_cierre_mv');
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`✅ Vista materializada actualizada en ${executionTime}ms`);

    // Verificar estado después de la actualización
    console.log('\n📊 Verificando estado después de la actualización...');
    const [newStats] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        MIN(fecha_trans) as fecha_minima,
        MAX(fecha_trans) as fecha_maxima,
        COUNT(DISTINCT codigo_presupuestario) as codigos_unicos
      FROM datalake.reportes_cierre_mv
    `);

    console.log('📈 Estado después de la actualización:');
    console.log(`   • Total registros: ${newStats[0].total_registros.toLocaleString()}`);
    console.log(`   • Fecha mínima: ${newStats[0].fecha_minima}`);
    console.log(`   • Fecha máxima: ${newStats[0].fecha_maxima}`);
    console.log(`   • Códigos únicos: ${newStats[0].codigos_unicos}`);

    // Comparar resultados
    const registrosDiff = newStats[0].total_registros - currentStats[0].total_registros;
    console.log('\n📊 Comparación:');
    console.log(`   • Diferencia de registros: ${registrosDiff > 0 ? '+' : ''}${registrosDiff.toLocaleString()}`);
    console.log(`   • Tiempo de actualización: ${executionTime}ms`);
    console.log(`   • Registros por segundo: ${Math.round(newStats[0].total_registros / (executionTime / 1000)).toLocaleString()}`);

    // Probar rendimiento de consulta después de la actualización
    console.log('\n⚡ Probando rendimiento de consulta...');
    const queryStartTime = Date.now();
    
    const [performanceTest] = await xmlsSequelize.query(`
      SELECT 
        codigo_presupuestario,
        COUNT(*) as cantidad_conceptos,
        SUM(total_monto) as total_monto
      FROM datalake.reportes_cierre_mv
      GROUP BY codigo_presupuestario
      ORDER BY total_monto DESC
      LIMIT 5
    `);
    
    const queryEndTime = Date.now();
    const queryExecutionTime = queryEndTime - queryStartTime;
    
    console.log(`🚀 Tiempo de consulta: ${queryExecutionTime}ms`);
    console.log('📊 Top 5 códigos presupuestarios:');
    performanceTest.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.codigo_presupuestario}: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(item.total_monto)}`);
    });

    console.log('\n🎯 Resumen de la prueba:');
    console.log(`   ✅ Vista materializada actualizada exitosamente`);
    console.log(`   ⚡ Tiempo de actualización: ${executionTime}ms`);
    console.log(`   🚀 Tiempo de consulta: ${queryExecutionTime}ms`);
    console.log(`   📊 Total registros procesados: ${newStats[0].total_registros.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

testRefreshMaterializedView(); 