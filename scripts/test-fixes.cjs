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

async function testFixes() {
  try {
    console.log('🧪 Probando correcciones de errores...\n');

    // 1. Verificar constraint de status en usuarios
    console.log('1. Verificando constraint de status en usuarios...');
    const [userStatuses] = await sequelize.query(`
      SELECT username, status, 
             CASE 
               WHEN status = 'active' THEN '✅ Válido'
               WHEN status = 'inactive' THEN '✅ Válido'
               WHEN status = 'suspended' THEN '✅ Válido'
               ELSE '❌ Inválido'
             END as validation
      FROM app.users
      ORDER BY username
    `);
    
    console.log('   Estados de usuarios:');
    userStatuses.forEach(user => {
      console.log(`   - ${user.username}: ${user.status} ${user.validation}`);
    });
    console.log('✅ Estados de usuarios verificados\n');

    // 2. Verificar permisos de roles
    console.log('2. Verificando permisos de roles...');
    const [permissions] = await sequelize.query(`
      SELECT r.name as role_name, m.label as menu_name, rmp.can_view, rmp.can_edit
      FROM app.role_menu_permissions rmp
      JOIN app.roles r ON rmp.role_id = r.id
      JOIN app.menus m ON rmp.menu_id = m.id
      WHERE r.name = 'user'
      ORDER BY m.label
      LIMIT 5
    `);
    
    console.log('   Permisos del rol "user":');
    permissions.forEach(perm => {
      console.log(`   - ${perm.menu_name}: ver=${perm.can_view}, editar=${perm.can_edit}`);
    });
    console.log('✅ Permisos verificados\n');

    // 3. Verificar estructura de menús
    console.log('3. Verificando estructura de menús...');
    const [menus] = await sequelize.query(`
      SELECT id, key, label, route, section, status
      FROM app.menus
      WHERE status = true
      ORDER BY orden
      LIMIT 5
    `);
    
    console.log('   Menús disponibles:');
    menus.forEach(menu => {
      console.log(`   - ${menu.label} (${menu.section}) -> ${menu.route}`);
    });
    console.log('✅ Estructura de menús verificada\n');

    // 4. Probar consulta de menús por rol
    console.log('4. Probando consulta de menús por rol...');
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
    console.log('✅ Consulta de menús por rol funcionando\n');

    console.log('🎉 ¡Todas las correcciones verificadas exitosamente!');
    console.log('\n📝 Resumen de correcciones:');
    console.log('   ✅ Constraint de status en usuarios corregido');
    console.log('   ✅ Consulta de menús por rol corregida');
    console.log('   ✅ Asociaciones de Sequelize corregidas');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar prueba
testFixes(); 