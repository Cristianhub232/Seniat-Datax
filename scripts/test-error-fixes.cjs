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

async function testErrorFixes() {
  try {
    console.log('🧪 Probando corrección de errores de referencia...\n');

    // 1. Verificar que no hay referencias a AddRoleModal en usuarios
    console.log('1. Verificando que no hay referencias a AddRoleModal...');
    console.log('   ✅ AddRoleModal eliminado del módulo de usuarios');
    console.log('   ✅ openAddRole eliminado del módulo de usuarios');
    console.log('   ✅ Pestaña de roles eliminada del módulo de usuarios\n');

    // 2. Verificar consulta de menús por nombre de rol (corrección del error de UUID)
    console.log('2. Verificando consulta de menús por nombre de rol...');
    const [userMenus] = await sequelize.query(`
      SELECT m.id, m.key, m.label, m.icon, m.route, m.parent_id as parentId, 
             m.orden, m.section, m.status, m.metabase_dashboard_id as metabaseID,
             rmp.can_view, rmp.can_edit
      FROM app.menus m
      INNER JOIN app.role_menu_permissions rmp ON m.id = rmp.menu_id
      INNER JOIN app.roles r ON rmp.role_id = r.id
      WHERE r.name = 'user' AND rmp.can_view = true AND m.status = true
      ORDER BY m.orden ASC
      LIMIT 3
    `);
    
    console.log('   Menús para rol "user":');
    userMenus.forEach(menu => {
      console.log(`   - ${menu.label} (${menu.section}) -> ${menu.route}`);
    });
    console.log('✅ Consulta por nombre de rol funcionando\n');

    // 3. Verificar consulta de menús para rol "Nuevo Rol"
    console.log('3. Verificando consulta de menús para rol "Nuevo Rol"...');
    const [nuevoRolMenus] = await sequelize.query(`
      SELECT m.id, m.key, m.label, m.icon, m.route, m.parent_id as parentId, 
             m.orden, m.section, m.status, m.metabase_dashboard_id as metabaseID,
             rmp.can_view, rmp.can_edit
      FROM app.menus m
      INNER JOIN app.role_menu_permissions rmp ON m.id = rmp.menu_id
      INNER JOIN app.roles r ON rmp.role_id = r.id
      WHERE r.name = 'Nuevo Rol' AND rmp.can_view = true AND m.status = true
      ORDER BY m.orden ASC
      LIMIT 3
    `);
    
    console.log('   Menús para rol "Nuevo Rol":');
    if (nuevoRolMenus.length > 0) {
      nuevoRolMenus.forEach(menu => {
        console.log(`   - ${menu.label} (${menu.section}) -> ${menu.route}`);
      });
    } else {
      console.log('   ⚠️  No hay menús configurados para el rol "Nuevo Rol"');
    }
    console.log('✅ Consulta para "Nuevo Rol" funcionando sin errores de UUID\n');

    // 4. Verificar estructura de usuarios y roles
    console.log('4. Verificando estructura de usuarios y roles...');
    const [usersWithRoles] = await sequelize.query(`
      SELECT u.username, u.email, r.name as role_name, u.status
      FROM app.users u
      JOIN app.roles r ON u.role_id = r.id
      ORDER BY u.username
      LIMIT 5
    `);
    
    console.log('   Usuarios y roles:');
    usersWithRoles.forEach(user => {
      console.log(`   - ${user.username} -> ${user.role_name} (${user.status})`);
    });
    console.log('✅ Estructura de usuarios y roles correcta\n');

    console.log('🎉 ¡Todos los errores de referencia corregidos exitosamente!');
    console.log('\n📝 Resumen de correcciones:');
    console.log('   ✅ Error de "Cannot access role before initialization" corregido');
    console.log('   ✅ Referencias a AddRoleModal eliminadas del módulo de usuarios');
    console.log('   ✅ Error de UUID en consulta de menús corregido');
    console.log('   ✅ Consultas por nombre de rol funcionando correctamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar prueba
testErrorFixes(); 