const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

// Crear conexión a la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

async function insertCodigosPresupuestariosMenu() {
  try {
    console.log('🔍 Insertando menú de Códigos Presupuestarios...\n');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente\n');

    // Generar UUID para el menú
    const menuId = uuidv4();
    
    // Insertar el menú principal
    const menuResult = await sequelize.query(`
      INSERT INTO menus (id, key, label, icon, route, parent_id, orden, section, status)
      VALUES (
        '${menuId}',
        'codigos-presupuestarios',
        'Códigos Presupuestarios',
        'IconFileDescription',
        '/codigos-presupuestarios',
        NULL,
        4,
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

    console.log('✅ Menú de Códigos Presupuestarios insertado/actualizado\n');

    // Obtener el ID del menú insertado
    const insertedMenuId = menuResult[0][0].id;
    console.log(`📋 ID del menú: ${insertedMenuId}\n`);

    // Insertar permisos para el rol admin
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

    // Insertar permisos para el rol user
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

    // Verificar que se insertó correctamente
    const verifyResult = await sequelize.query(`
      SELECT m.id, m.label, m.icon, m.route, m.section, m.orden, m.status,
             rp."roleId", rp.canView, rp.canEdit
      FROM menus m
      LEFT JOIN roles_permissions rp ON m.id = rp."menuId"
      WHERE m.id = '${insertedMenuId}'
      ORDER BY rp."roleId";
    `);

    console.log('📋 Verificación de inserción:');
    console.table(verifyResult[0]);

    console.log('\n🎉 Menú de Códigos Presupuestarios configurado exitosamente!');
    console.log('📍 Ruta: /codigos-presupuestarios');
    console.log('🔧 Icono: IconFileDescription');
    console.log('📊 Sección: main');
    console.log('📋 Orden: 4');

  } catch (error) {
    console.error('❌ Error durante la inserción:', error);
  } finally {
    await sequelize.close();
    console.log('\n✅ Conexión cerrada');
  }
}

// Ejecutar la inserción
insertCodigosPresupuestariosMenu(); 