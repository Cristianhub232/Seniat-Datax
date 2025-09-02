const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkPermissionsTables() {
  try {
    await client.connect();
    console.log('🔌 Conexión establecida correctamente');

    // Verificar todas las tablas que contengan "permission" o "role"
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%permission%' OR table_name LIKE '%role%' OR table_name LIKE '%menu%')
      ORDER BY table_name
    `;

    const tablesResult = await client.query(tablesQuery);
    console.log('\n📋 Tablas relacionadas con permisos, roles y menús:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Verificar si existe alguna tabla de permisos
    const permissionsQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%permission%'
    `;

    const permissionsResult = await client.query(permissionsQuery);
    if (permissionsResult.rows.length > 0) {
      console.log('\n📊 Tablas de permisos encontradas:');
      permissionsResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('\n❌ No se encontraron tablas de permisos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPermissionsTables(); 