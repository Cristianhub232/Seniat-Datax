import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Conexión a la base de datos XMLS
const xmlsDatabaseUrl = process.env.XMLS_DATABASE_URL;
if (!xmlsDatabaseUrl) {
  console.error('❌ XMLS_DATABASE_URL no está configurada');
  process.exit(1);
}

const xmlsSequelize = new Sequelize(xmlsDatabaseUrl, {
  dialect: 'postgres',
  logging: false,
});

async function refreshMaterializedView() {
  try {
    console.log('🔌 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🔄 Refrescando vista materializada...');
    const startTime = Date.now();
    
    // Refrescar la vista materializada
    await xmlsSequelize.query('REFRESH MATERIALIZED VIEW datalake.planillas_recaudacion_2024_mv');
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ Vista materializada refrescada exitosamente en ${duration.toFixed(2)} segundos.`);
    
    // Verificar estadísticas después del refresh
    const [stats] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT rif_contribuyente) as contribuyentes_unicos,
        COUNT(DISTINCT nombre_banco) as bancos_unicos,
        SUM(monto_total_trans) as monto_total,
        AVG(monto_total_trans) as monto_promedio
      FROM datalake.planillas_recaudacion_2024_mv
    `);
    
    if (stats.length > 0) {
      console.log('📊 Estadísticas actualizadas:');
      console.log('   - Total registros:', stats[0].total_registros);
      console.log('   - Contribuyentes únicos:', stats[0].contribuyentes_unicos);
      console.log('   - Bancos únicos:', stats[0].bancos_unicos);
      console.log('   - Monto total:', new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats[0].monto_total));
      console.log('   - Monto promedio:', new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats[0].monto_promedio));
    }

  } catch (error) {
    console.error('❌ Error al refrescar la vista materializada:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await xmlsSequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
}

// Ejecutar el script
refreshMaterializedView(); 