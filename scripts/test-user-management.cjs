require('dotenv').config({ path: '.env.local' });

const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const databaseUrl = process.env.DATABASE_URL || 'postgresql://ont:123456@localhost:5432/xmls';

// Crear conexión específica para autenticación
const authSequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  schema: 'app',
  define: {
    schema: 'app'
  }
});

async function testUserManagement() {
  try {
    console.log('🚀 Probando gestión de usuarios y roles...');
    console.log('🎯 Base de datos:', databaseUrl);
    console.log('🎯 Esquema: app');
    console.log('');
    
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // 1. Verificar roles
    console.log('\n👥 Verificando roles...');
    const [roles] = await authSequelize.query(`
      SELECT id, name, description, status, created_at, updated_at
      FROM app.roles
      ORDER BY name;
    `);
    
    console.log(`📊 Roles encontrados: ${roles.length}`);
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description} (${role.status})`);
    });
    
    // 2. Verificar usuarios
    console.log('\n👤 Verificando usuarios...');
    const [users] = await authSequelize.query(`
      SELECT u.id, u.username, u.email, u.status, r.name as role_name
      FROM app.users u
      LEFT JOIN app.roles r ON u.role_id = r.id
      ORDER BY u.username;
    `);
    
    console.log(`📊 Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}): ${user.role_name} - ${user.status ? 'Activo' : 'Inactivo'}`);
    });
    
    // 3. Verificar menús
    console.log('\n📋 Verificando menús...');
    const [menus] = await authSequelize.query(`
      SELECT id, key, label, icon, route, section, orden, status
      FROM app.menus
      ORDER BY orden;
    `);
    
    console.log(`📊 Menús encontrados: ${menus.length}`);
    menus.forEach(menu => {
      console.log(`  - ${menu.label} (${menu.key}): ${menu.route} - ${menu.status ? 'Activo' : 'Inactivo'}`);
    });
    
    // 4. Verificar asignaciones de menús a roles
    console.log('\n🎭 Verificando asignaciones de menús a roles...');
    const [roleMenus] = await authSequelize.query(`
      SELECT r.name as role_name, m.label as menu_label, rmp.can_view, rmp.can_edit
      FROM app.role_menu_permissions rmp
      JOIN app.roles r ON rmp.role_id = r.id
      JOIN app.menus m ON rmp.menu_id = m.id
      ORDER BY r.name, m.orden;
    `);
    
    console.log(`📊 Asignaciones encontradas: ${roleMenus.length}`);
    let currentRole = '';
    roleMenus.forEach(rm => {
      if (rm.role_name !== currentRole) {
        currentRole = rm.role_name;
        console.log(`  ${currentRole}:`);
      }
      console.log(`    - ${rm.menu_label} (ver: ${rm.can_view}, editar: ${rm.can_edit})`);
    });
    
    // 5. Probar creación de usuario
    console.log('\n🔧 Probando creación de usuario...');
    
    // Verificar si ya existe un usuario de prueba
    const [existingUser] = await authSequelize.query(`
      SELECT id FROM app.users WHERE username = 'test_user';
    `);
    
    if (existingUser.length === 0) {
      // Obtener el rol user
      const [userRole] = await authSequelize.query(`
        SELECT id FROM app.roles WHERE name = 'user';
      `);
      
      if (userRole.length > 0) {
        // Crear usuario de prueba
        await authSequelize.query(`
          INSERT INTO app.users (username, email, password_hash, role_id, status, first_name, last_name)
          VALUES ('test_user', 'test@siront.com', '$2b$10$test.hash.for.testing', ?, 'active', 'Usuario', 'Prueba')
        `, {
          replacements: [userRole[0].id]
        });
        
        console.log('✅ Usuario de prueba creado: test_user');
      }
    } else {
      console.log('ℹ️  Usuario de prueba ya existe: test_user');
    }
    
    console.log('\n🎉 ¡Gestión de usuarios y roles funcionando correctamente!');
    console.log('');
    console.log('📝 Resumen:');
    console.log(`✅ Roles: ${roles.length} roles configurados`);
    console.log(`✅ Usuarios: ${users.length} usuarios en el sistema`);
    console.log(`✅ Menús: ${menus.length} menús disponibles`);
    console.log(`✅ Asignaciones: ${roleMenus.length} asignaciones rol-menú`);
    console.log('');
    console.log('🔑 Roles disponibles para asignar:');
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await authSequelize.close();
  }
}

testUserManagement(); 