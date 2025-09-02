const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.XMLS_DATABASE_URL,
});

async function checkMVExists() {
  try {
    await client.connect();
    console.log('🔌 Conexión establecida correctamente');

    // Verificar directamente si la vista existe
    const query = `
      SELECT schemaname, matviewname 
      FROM pg_matviews 
      WHERE schemaname = 'datalake' 
      AND matviewname = 'planillas_sin_conceptos_mv'
    `;
    
    const result = await client.query(query);
    console.log('\n📊 Resultado de la consulta:');
    console.log(result.rows);

    if (result.rows.length > 0) {
      console.log('✅ Vista materializada existe');
      
      // Intentar contar registros
      const countQuery = 'SELECT COUNT(*) as total FROM datalake.planillas_sin_conceptos_mv';
      const countResult = await client.query(countQuery);
      console.log(`📈 Total de registros: ${countResult.rows[0].total}`);
    } else {
      console.log('❌ Vista materializada no existe');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkMVExists(); 