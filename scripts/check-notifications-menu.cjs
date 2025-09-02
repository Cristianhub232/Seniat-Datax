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

async function checkNotificationsMenu() {
  try {
    console.log('🔍 Verificando módulo de notificaciones en menús...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar si existe el menú de notificaciones
    console.log('2. Verificando menú de notificaciones...');
    const [notificationsMenu] = await sequelize.query(`
      SELECT * FROM app.menus WHERE label = 'Notificaciones' OR key = 'notificaciones'
    `);

    if (notificationsMenu.length > 0) {
      console.log('✅ Menú de notificaciones encontrado:');
      notificationsMenu.forEach((menu, index) => {
        console.log(`   ${index + 1}. ${menu.label} (${menu.key})`);
        console.log(`      ID: ${menu.id}`);
        console.log(`      Ruta: ${menu.route}`);
        console.log(`      Icono: ${menu.icon}`);
        console.log(`      Orden: ${menu.orden}`);
        console.log(`      Estado: ${menu.status}`);
        console.log('');
      });
    } else {
      console.log('❌ Menú de notificaciones no encontrado');
    }

    // 3. Verificar todos los menús para ver el orden
    console.log('3. Verificando todos los menús...');
    const [allMenus] = await sequelize.query(`
      SELECT id, label, key, route, icon, orden, status
      FROM app.menus
      ORDER BY orden ASC
    `);

    console.log('📋 Todos los menús:');
    allMenus.forEach((menu, index) => {
      console.log(`   ${index + 1}. ${menu.label} (${menu.key}) - Orden: ${menu.orden}`);
    });

    // 4. Verificar si hay menús especiales
    console.log('\n4. Verificando menús especiales...');
    const specialMenus = ['Reportes de Cierre', 'Formas no Validadas', 'Creación de Conceptos', 'Notificaciones'];
    
    specialMenus.forEach(menuTitle => {
      const found = allMenus.find(menu => menu.label === menuTitle);
      if (found) {
        console.log(`   ✅ ${menuTitle} - Orden: ${found.orden}`);
      } else {
        console.log(`   ❌ ${menuTitle} - No encontrado`);
      }
    });

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
checkNotificationsMenu(); 