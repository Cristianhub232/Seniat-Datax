const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkRoleMenuPermissionsStructure() {
  try {
    await client.connect();
    console.log('🔌 Conexión establecida correctamente');

    // Verificar estructura de la tabla role_menu_permissions
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'role_menu_permissions'
      ORDER BY ordinal_position
    `;

    const structureResult = await client.query(structureQuery);
    console.log('\n📋 Estructura de la tabla role_menu_permissions:');
    structureResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });

    // Verificar datos existentes
    const dataQuery = 'SELECT * FROM role_menu_permissions LIMIT 3';
    const dataResult = await client.query(dataQuery);
    console.log('\n📊 Datos de ejemplo:');
    dataResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${JSON.stringify(row, null, 2)}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkRoleMenuPermissionsStructure(); 