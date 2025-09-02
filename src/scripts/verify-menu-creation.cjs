const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function verifyMenuCreation() {
  try {
    await client.connect();
    console.log('🔌 Conexión establecida correctamente');

    // Verificar si el menú existe
    const menuQuery = `
      SELECT id, key, label, route, icon, section, status, orden
      FROM menus 
      WHERE label = 'Creación de Conceptos'
    `;
    
    const menuResult = await client.query(menuQuery);
    console.log('\n📋 Menú "Creación de Conceptos":');
    if (menuResult.rows.length > 0) {
      const menu = menuResult.rows[0];
      console.log(`   - ID: ${menu.id}`);
      console.log(`   - Key: ${menu.key}`);
      console.log(`   - Label: ${menu.label}`);
      console.log(`   - Route: ${menu.route}`);
      console.log(`   - Icon: ${menu.icon}`);
      console.log(`   - Section: ${menu.section}`);
      console.log(`   - Status: ${menu.status}`);
      console.log(`   - Orden: ${menu.orden}`);
    } else {
      console.log('❌ Menú no encontrado');
    }

    // Verificar permisos
    const permissionsQuery = `
      SELECT rmp.id, r.name as role_name, m.label as menu_name
      FROM role_menu_permissions rmp
      JOIN roles r ON rmp.role_id = r.id
      JOIN menus m ON rmp.menu_id = m.id
      WHERE m.label = 'Creación de Conceptos'
    `;
    
    const permissionsResult = await client.query(permissionsQuery);
    console.log('\n📋 Permisos asignados:');
    if (permissionsResult.rows.length > 0) {
      permissionsResult.rows.forEach((perm, index) => {
        console.log(`   ${index + 1}. Rol: ${perm.role_name} - Menú: ${perm.menu_name}`);
      });
    } else {
      console.log('❌ No se encontraron permisos');
    }

    // Listar todos los menús activos
    const allMenusQuery = `
      SELECT label, route, icon, orden, section, status
      FROM menus 
      WHERE status = true
      ORDER BY orden ASC, label ASC
    `;
    
    const allMenusResult = await client.query(allMenusQuery);
    console.log('\n📋 Todos los menús activos:');
    allMenusResult.rows.forEach((menu, index) => {
      console.log(`   ${index + 1}. ${menu.label} (${menu.route}) - Orden: ${menu.orden}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyMenuCreation(); 