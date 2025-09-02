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

async function insertNotificationsMenu() {
  try {
    console.log('📢 Insertando menú de Notificaciones...\n');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Verificar si el menú ya existe
    const [existingMenu] = await sequelize.query(`
      SELECT id FROM app.menus WHERE route = '/notificaciones'
    `);

    if (existingMenu.length > 0) {
      console.log('✅ Menú de Notificaciones ya existe');
    } else {
      // Insertar el menú de notificaciones
      const [result] = await sequelize.query(`
        INSERT INTO app.menus (
          key,
          label,
          icon,
          route,
          orden,
          status
        ) VALUES (
          'notificaciones',
          'Notificaciones',
          'bell',
          '/notificaciones',
          14,
          true
        ) RETURNING id, key, label, icon, route, orden, status
      `);

      if (result.length > 0) {
        const menu = result[0];
        console.log('✅ Menú de Notificaciones insertado exitosamente:');
        console.log(`   ID: ${menu.id}`);
        console.log(`   Key: ${menu.key}`);
        console.log(`   Label: ${menu.label}`);
        console.log(`   Icon: ${menu.icon}`);
        console.log(`   Route: ${menu.route}`);
        console.log(`   Orden: ${menu.orden}`);
        console.log(`   Status: ${menu.status ? 'Activo' : 'Inactivo'}`);
      }
    }



    // Verificar el menú insertado
    const [menus] = await sequelize.query(`
      SELECT id, key, label, icon, route, orden, status
      FROM app.menus
      ORDER BY orden ASC
    `);

    console.log('\n📋 Lista completa de menús:');
    menus.forEach(menu => {
      console.log(`   ${menu.orden}. ${menu.label} (${menu.route}) - ${menu.status ? '✅' : '❌'}`);
    });

    console.log('\n🎉 ¡Menú de Notificaciones configurado exitosamente!');
    console.log('🚀 El módulo de notificaciones está disponible en el menú lateral');

  } catch (error) {
    console.error('❌ Error insertando menú de notificaciones:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar inserción
insertNotificationsMenu(); 