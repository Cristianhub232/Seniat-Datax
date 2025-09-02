const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const databaseUrl = 'postgresql://ont:123456@localhost:5432/xmls';
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  schema: 'app',
  define: {
    schema: 'app'
  }
});

async function testRolePermissions() {
  try {
    console.log('🔍 Probando permisos de roles...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener un rol de prueba
    const [roles] = await sequelize.query('SELECT id, name FROM app.roles LIMIT 1');
    if (roles.length === 0) {
      console.log('❌ No hay roles en la base de datos');
      return;
    }

    const roleId = roles[0].id;
    console.log(`📋 Probando con rol: ${roles[0].name} (ID: ${roleId})`);

    // Verificar si existen permisos para este rol
    const [permissions] = await sequelize.query(`
      SELECT rmp.*, m.key, m.label, m.route, m.section 
      FROM app.role_menu_permissions rmp
      LEFT JOIN app.menus m ON rmp.menu_id = m.id
      WHERE rmp.role_id = '${roleId}'
    `);

    console.log(`📊 Permisos encontrados: ${permissions.length}`);
    permissions.forEach(perm => {
      console.log(`  - ${perm.label} (${perm.key}): ver=${perm.can_view}, editar=${perm.can_edit}`);
    });

    // Verificar menús disponibles
    const [menus] = await sequelize.query('SELECT id, key, label, route, section FROM app.menus ORDER BY orden');
    console.log(`\n📋 Menús disponibles: ${menus.length}`);
    menus.forEach(menu => {
      console.log(`  - ${menu.label} (${menu.key}): ${menu.route}`);
    });

    // Crear algunos permisos de prueba si no existen
    if (permissions.length === 0) {
      console.log('\n🔧 Creando permisos de prueba...');
      
      const testPermissions = menus.slice(0, 3).map(menu => ({
        role_id: roleId,
        menu_id: menu.id,
        can_view: true,
        can_edit: false
      }));

      await sequelize.query(`
        INSERT INTO app.role_menu_permissions (role_id, menu_id, can_view, can_edit)
        VALUES ${testPermissions.map(() => '(?, ?, ?, ?)').join(', ')}
      `, {
        replacements: testPermissions.flatMap(p => [p.role_id, p.menu_id, p.can_view, p.can_edit])
      });

      console.log(`✅ Creados ${testPermissions.length} permisos de prueba`);
    }

    console.log('\n✨ Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await sequelize.close();
  }
}

testRolePermissions(); 