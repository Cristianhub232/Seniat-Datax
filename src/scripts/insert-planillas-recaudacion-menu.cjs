const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

async function insertPlanillasRecaudacionMenu() {
  try {
    console.log('🔍 Insertando menú de Planillas de Recaudación 2024...\n');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente\n');

    const menuId = uuidv4();
    
    // Insertar el menú principal
    const menuResult = await sequelize.query(`
      INSERT INTO menus (id, key, label, icon, route, parent_id, orden, section, status)
      VALUES (
        '${menuId}',
        'planillas-recaudacion',
        'Planillas de Recaudación 2024',
        'IconFileDescription',
        '/planillas-recaudacion',
        NULL,
        5,
        'main',
        true
      )
      ON CONFLICT (key) DO UPDATE SET
        label = EXCLUDED.label,
        icon = EXCLUDED.icon,
        route = EXCLUDED.route,
        orden = EXCLUDED.orden,
        section = EXCLUDED.section,
        status = EXCLUDED.status
      RETURNING id;
    `);

    console.log('✅ Menú de Planillas de Recaudación 2024 insertado/actualizado\n');
    const insertedMenuId = menuResult[0][0].id;
    console.log(`📋 ID del menú: ${insertedMenuId}\n`);

    // Intentar insertar permisos para admin
    try {
      const adminPermissionResult = await sequelize.query(`
        INSERT INTO roles_permissions (roleId, menuId, canView, canEdit)
        VALUES (
          'admin',
          '${insertedMenuId}',
          true,
          true
        )
        ON CONFLICT ("roleId", "menuId") DO UPDATE SET
          canView = EXCLUDED.canView,
          canEdit = EXCLUDED.canEdit
        RETURNING "roleId", "menuId";
      `);
      console.log('✅ Permisos para admin insertados/actualizados\n');
    } catch (error) {
      console.log('⚠️  No se pudieron insertar permisos para admin (tabla roles_permissions no existe)\n');
    }

    // Intentar insertar permisos para user
    try {
      const userPermissionResult = await sequelize.query(`
        INSERT INTO roles_permissions (roleId, menuId, canView, canEdit)
        VALUES (
          'user',
          '${insertedMenuId}',
          true,
          false
        )
        ON CONFLICT ("roleId", "menuId") DO UPDATE SET
          canView = EXCLUDED.canView,
          canEdit = EXCLUDED.canEdit
        RETURNING "roleId", "menuId";
      `);
      console.log('✅ Permisos para user insertados/actualizados\n');
    } catch (error) {
      console.log('⚠️  No se pudieron insertar permisos para user (tabla roles_permissions no existe)\n');
    }

    // Verificar la inserción
    const verifyResult = await sequelize.query(`
      SELECT m.id, m.label, m.icon, m.route, m.section, m.orden, m.status
      FROM menus m
      WHERE m.id = '${insertedMenuId}';
    `);
    console.table(verifyResult[0]);
    console.log('\n🎉 Menú de Planillas de Recaudación 2024 configurado exitosamente!');
    console.log('📍 Ruta: /planillas-recaudacion');
    console.log('🔧 Icono: IconFileDescription');
    console.log('📊 Sección: main');
    console.log('📋 Orden: 5');
  } catch (error) {
    console.error('❌ Error durante la inserción:', error);
  } finally {
    await sequelize.close();
    console.log('\n✅ Conexión cerrada');
  }
}

insertPlanillasRecaudacionMenu(); 