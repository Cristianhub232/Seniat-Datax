const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos XMLS
const xmlsSequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function addUniqueIndexToMaterializedView() {
  try {
    console.log('🔍 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Crear índice único para permitir REFRESH CONCURRENTLY
    console.log('\n🔧 Creando índice único para vista materializada...');
    
    const uniqueIndexQuery = `
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_reportes_cierre_mv_unique 
      ON datalake.reportes_cierre_mv (codigo_presupuestario, planilla_id, concepto_id)
    `;

    await xmlsSequelize.query(uniqueIndexQuery);
    console.log('✅ Índice único creado exitosamente');

    // Verificar que el índice se creó
    console.log('\n📊 Verificando índices de la vista materializada...');
    const [indexes] = await xmlsSequelize.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'datalake' 
      AND tablename = 'reportes_cierre_mv'
      ORDER BY indexname
    `);

    console.log('📈 Índices encontrados:');
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.indexname}`);
    });

    // Probar REFRESH CONCURRENTLY
    console.log('\n🔄 Probando REFRESH CONCURRENTLY...');
    const startTime = Date.now();

    await xmlsSequelize.query('REFRESH MATERIALIZED VIEW CONCURRENTLY datalake.reportes_cierre_mv');
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`✅ REFRESH CONCURRENTLY exitoso en ${executionTime}ms`);

    // Verificar estado final
    console.log('\n📊 Estado final de la vista materializada...');
    const [finalStats] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT codigo_presupuestario) as codigos_unicos
      FROM datalake.reportes_cierre_mv
    `);

    console.log('📈 Estadísticas finales:');
    console.log(`   • Total registros: ${finalStats[0].total_registros.toLocaleString()}`);
    console.log(`   • Códigos únicos: ${finalStats[0].codigos_unicos}`);

    console.log('\n🎯 Resumen:');
    console.log('   ✅ Índice único creado exitosamente');
    console.log('   ✅ REFRESH CONCURRENTLY funcionando');
    console.log('   ✅ Vista materializada optimizada para actualizaciones');

  } catch (error) {
    console.error('❌ Error durante la creación del índice:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

addUniqueIndexToMaterializedView(); 