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

async function testAPIQuery() {
  try {
    console.log('🔌 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // Simular exactamente la misma query que usa la API
    const page = 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const query = `
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
      LIMIT $1 OFFSET $2
    `;
    
    const params = [limit, offset];
    
    console.log('⚡ Ejecutando query de la API...');
    console.log('Query:', query);
    console.log('Params:', params);
    
    const result = await xmlsSequelize.query(query, {
      bind: params,
      type: 'SELECT'
    });

    console.log('📊 Resultado completo:', result);
    console.log('📊 Result[0]:', result[0]);
    console.log('📊 Cantidad de registros:', Array.isArray(result[0]) ? result[0].length : 'No es array');
    console.log('📊 Tipo de result[0]:', typeof result[0]);
    
    if (Array.isArray(result[0])) {
      console.log('📋 Registros obtenidos:');
      result[0].forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.rif_contribuyente} - ${record.cod_seg_planilla}`);
      });
    }

    // Probar también con la query de conteo
    const countQuery = `
      SELECT COUNT(*) as total
      FROM datalake.planillas_recaudacion_2024_mv
      WHERE registro = true
    `;
    
    console.log('\n⚡ Ejecutando query de conteo...');
    const countResult = await xmlsSequelize.query(countQuery, {
      type: 'SELECT'
    });
    
    console.log('📊 Count result:', countResult);
    console.log('📊 Count result[0]:', countResult[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await xmlsSequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
}

// Ejecutar el script
testAPIQuery(); 