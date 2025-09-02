const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const config = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

const sequelize = new Sequelize(config);

async function refreshPlanillasSinConceptosMV() {
  try {
    console.log('🔄 Refrescando vista materializada de planillas sin conceptos...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar si la vista existe
    console.log('2. Verificando si la vista materializada existe...');
    const [views] = await sequelize.query(`
      SELECT matviewname 
      FROM pg_matviews 
      WHERE schemaname = 'datalake' AND matviewname = 'planillas_sin_conceptos_mv'
    `);

    if (views.length === 0) {
      console.log('❌ La vista materializada no existe');
      return;
    }
    console.log('✅ Vista materializada encontrada\n');

    // 3. Refrescar la vista
    console.log('3. Refrescando vista materializada...');
    const startTime = Date.now();
    
    await sequelize.query('REFRESH MATERIALIZED VIEW datalake.planillas_sin_conceptos_mv');
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ Vista materializada refrescada exitosamente en ${duration.toFixed(2)} segundos\n`);

    // 4. Verificar datos actualizados
    console.log('4. Verificando datos actualizados...');
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_planillas,
        COUNT(DISTINCT codigo_forma) as formas_unicas,
        COUNT(DISTINCT rif_contribuyente) as contribuyentes_unicos,
        SUM(monto_total_trans) as monto_total
      FROM datalake.planillas_sin_conceptos_mv
    `);

    if (stats.length > 0) {
      console.log('📊 Estadísticas actualizadas:');
      console.log(`   - Total planillas: ${stats[0].total_planillas}`);
      console.log(`   - Formas únicas: ${stats[0].formas_unicas}`);
      console.log(`   - Contribuyentes únicos: ${stats[0].contribuyentes_unicos}`);
      console.log(`   - Monto total: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats[0].monto_total)}`);
    }

    // 5. Verificar nombres de formas actualizados
    console.log('\n5. Verificando nombres de formas...');
    const [formas] = await sequelize.query(`
      SELECT DISTINCT codigo_forma, nombre_forma
      FROM datalake.planillas_sin_conceptos_mv
      ORDER BY codigo_forma
    `);

    console.log('📋 Formas disponibles:');
    formas.forEach((forma, index) => {
      console.log(`   ${index + 1}. ${forma.codigo_forma} - ${forma.nombre_forma}`);
    });

    console.log('\n🎉 ¡Vista materializada actualizada exitosamente!');
    console.log('💡 Los nombres de formas ahora deberían estar actualizados en el módulo de creación de conceptos.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar refresco
refreshPlanillasSinConceptosMV(); 