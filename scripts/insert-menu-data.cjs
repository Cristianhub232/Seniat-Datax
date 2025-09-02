const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const dbConfig = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

async function insertMenuData() {
  const sequelize = new Sequelize(dbConfig);
  
  try {
    console.log('📝 Insertando datos de menú...');
    
    // Verificar si ya existen menús
    const [existingMenus] = await sequelize.query('SELECT COUNT(*) as count FROM app.menus;');
    
    if (existingMenus[0].count > 0) {
      console.log('ℹ️  Los menús ya existen, saltando inserción');
      return;
    }
    
    // Insertar menús principales
    const menus = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'IconDashboard',
        route: '/',
        section: 'main',
        parent_id: null
      },
      {
        key: 'usuarios',
        label: 'Usuarios',
        icon: 'IconUsers',
        route: '/usuarios',
        section: 'main',
        parent_id: null
      },
      {
        key: 'bancos',
        label: 'Consulta Bancos',
        icon: 'IconBuildingBank',
        route: '/consulta-bancos',
        section: 'main',
        parent_id: null
      },
      {
        key: 'codigos-presupuestarios',
        label: 'Códigos Presupuestarios',
        icon: 'IconFileCode',
        route: '/codigos-presupuestarios',
        section: 'main',
        parent_id: null
      },
      {
        key: 'empresas-petroleras',
        label: 'Empresas Petroleras',
        icon: 'IconBuildingFactory',
        route: '/empresas-petroleras',
        section: 'main',
        parent_id: null
      },
      {
        key: 'formas',
        label: 'Consulta Formas',
        icon: 'IconFileText',
        route: '/consulta-formas',
        section: 'main',
        parent_id: null
      },
      {
        key: 'formas-no-validadas',
        label: 'Formas No Validadas',
        icon: 'IconFileX',
        route: '/formas-no-validadas',
        section: 'main',
        parent_id: null
      },
      {
        key: 'creacion-conceptos',
        label: 'Creación Conceptos',
        icon: 'IconPlus',
        route: '/creacion-conceptos',
        section: 'main',
        parent_id: null
      },
      {
        key: 'planillas-recaudacion',
        label: 'Planillas Recaudación',
        icon: 'IconReceipt',
        route: '/planillas-recaudacion',
        section: 'main',
        parent_id: null
      },
      {
        key: 'reportes-cierre',
        label: 'Reportes Cierre',
        icon: 'IconReportAnalytics',
        route: '/reportes-cierre',
        section: 'main',
        parent_id: null
      }
    ];
    
    // Insertar menús
    for (const menu of menus) {
      await sequelize.query(`
        INSERT INTO app.menus (key, label, icon, route, section, parent_id, status)
        VALUES (?, ?, ?, ?, ?, ?, true)
      `, {
        replacements: [menu.key, menu.label, menu.icon, menu.route, menu.section, menu.parent_id]
      });
    }
    
    console.log(`✅ ${menus.length} menús insertados exitosamente`);
    
    // Obtener roles
    const [roles] = await sequelize.query('SELECT id, name FROM app.roles;');
    
    // Obtener menús insertados
    const [insertedMenus] = await sequelize.query('SELECT id, key FROM app.menus;');
    
    // Crear permisos para el rol admin (acceso completo)
    for (const role of roles) {
      for (const menu of insertedMenus) {
        await sequelize.query(`
          INSERT INTO app.role_menu_permissions (role_id, menu_id, can_view, can_edit)
          VALUES (?, ?, true, ?)
        `, {
          replacements: [role.id, menu.id, role.name === 'admin']
        });
      }
    }
    
    console.log(`✅ Permisos creados para ${roles.length} roles y ${insertedMenus.length} menús`);
    
    // Verificar datos insertados
    const [menuCount] = await sequelize.query('SELECT COUNT(*) as count FROM app.menus;');
    const [permissionCount] = await sequelize.query('SELECT COUNT(*) as count FROM app.role_menu_permissions;');
    
    console.log(`📊 Resumen:`);
    console.log(`   - Menús: ${menuCount[0].count}`);
    console.log(`   - Permisos: ${permissionCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error insertando datos de menú:', error.message);
  } finally {
    await sequelize.close();
  }
}

insertMenuData(); 