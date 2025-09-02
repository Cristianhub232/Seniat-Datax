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

async function testMaterializedView() {
  try {
    console.log('🔌 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // Probar la vista materializada directamente
    console.log('📋 Probando la vista materializada...');
    
    // Query principal
    const mainQuery = `
      SELECT 
        rif_contribuyente,
        cod_seg_planilla,
        fecha_trans,
        monto_total_trans,
        nombre_banco,
        codigo_banco
      FROM datalake.planillas_recaudacion_2024_mv
      WHERE registro = true
      ORDER BY fecha_trans DESC
      LIMIT 5
    `;
    
    console.log('⚡ Ejecutando query principal...');
    const [mainResult] = await xmlsSequelize.query(mainQuery);
    console.log('✅ Query principal ejecutada exitosamente.');
    console.log('📊 Registros obtenidos:', mainResult.length);
    console.log('📋 Primer registro:', mainResult[0]);

    // Query de conteo
    const countQuery = `
      SELECT COUNT(*) as total
      FROM datalake.planillas_recaudacion_2024_mv
      WHERE registro = true
    `;
    
    console.log('\n⚡ Ejecutando query de conteo...');
    const [countResult] = await xmlsSequelize.query(countQuery);
    console.log('✅ Query de conteo ejecutada exitosamente.');
    console.log('📊 Resultado del conteo:', countResult[0]);

    // Probar con filtros
    console.log('\n⚡ Probando con filtros...');
    const filterQuery = `
      SELECT COUNT(*) as total
      FROM datalake.planillas_recaudacion_2024_mv
      WHERE registro = true
      AND nombre_banco ILIKE '%Bicentenario%'
    `;
    
    const [filterResult] = await xmlsSequelize.query(filterQuery);
    console.log('📊 Resultado con filtro de banco:', filterResult[0]);

    // Probar paginación
    console.log('\n⚡ Probando paginación...');
    const paginationQuery = `
      SELECT 
        rif_contribuyente,
        cod_seg_planilla,
        fecha_trans,
        monto_total_trans,
        nombre_banco,
        codigo_banco
      FROM datalake.planillas_recaudacion_2024_mv
      WHERE registro = true
      ORDER BY fecha_trans DESC
      LIMIT 10 OFFSET 0
    `;
    
    const [paginationResult] = await xmlsSequelize.query(paginationQuery);
    console.log('📊 Registros con paginación:', paginationResult.length);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await xmlsSequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
}

// Ejecutar el script
testMaterializedView(); 