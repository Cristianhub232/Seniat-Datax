const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos principal
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function insertReportesCierreMenu() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Insertar el menú de reportes de cierre
    const menuId = uuidv4();
    const [result] = await sequelize.query(`
      INSERT INTO public.menus (id, key, label, icon, route, parent_id, orden, section, status, metabase_dashboard_id)
      VALUES (
        '${menuId}',
        'reportes-cierre',
        'Reportes de Cierre',
        'IconFileReport',
        '/reportes-cierre',
        NULL,
        4,
        'main',
        true,
        NULL
      )
      ON CONFLICT (key) DO NOTHING
      RETURNING id, key, label;
    `);

    if (result && result.length > 0) {
      console.log('✅ Menú de reportes de cierre insertado correctamente:');
      console.log('ID:', result[0].id);
      console.log('Key:', result[0].key);
      console.log('Label:', result[0].label);
    } else {
      console.log('ℹ️ El menú de reportes de cierre ya existe o no se pudo insertar.');
    }

    if (result && result.length > 0) {
      const menuId = result[0].id;
      
      // Obtener todos los roles
      const [roles] = await sequelize.query(`
        SELECT id FROM public.roles
      `);

      // Insertar permisos para todos los roles
      for (const role of roles) {
        await sequelize.query(`
          INSERT INTO public.roles_menu_permissions (id, role_id, menu_id, can_view, can_edit, created_at, updated_at)
          VALUES (
            '${uuidv4()}',
            '${role.id}',
            '${menuId}',
            true,
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT (role_id, menu_id) DO UPDATE SET
            can_view = EXCLUDED.can_view,
            can_edit = EXCLUDED.can_edit,
            updated_at = NOW()
        `);
      }

      console.log(`✅ Permisos insertados para ${roles.length} roles.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

insertReportesCierreMenu(); 