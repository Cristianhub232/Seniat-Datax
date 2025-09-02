const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos principal
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function checkMenu() {
  try {
    console.log('🔍 Verificando menús en la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar todos los menús
    const [menus] = await sequelize.query(`
      SELECT id, key, label, icon, route, orden, section, status
      FROM public.menus
      ORDER BY orden ASC
    `);

    console.log('\n📋 Menús disponibles:');
    menus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.label} (${menu.key})`);
      console.log(`   Ruta: ${menu.route}`);
      console.log(`   Icono: ${menu.icon}`);
      console.log(`   Orden: ${menu.orden}`);
      console.log(`   Sección: ${menu.section}`);
      console.log(`   Estado: ${menu.status ? 'Activo' : 'Inactivo'}`);
      console.log('');
    });

    // Verificar específicamente el menú de reportes de cierre
    const [reportesMenu] = await sequelize.query(`
      SELECT * FROM public.menus WHERE key = 'reportes-cierre'
    `);

    if (reportesMenu.length > 0) {
      console.log('✅ Menú de Reportes de Cierre encontrado:');
      console.log(`   ID: ${reportesMenu[0].id}`);
      console.log(`   Key: ${reportesMenu[0].key}`);
      console.log(`   Label: ${reportesMenu[0].label}`);
      console.log(`   Icon: ${reportesMenu[0].icon}`);
      console.log(`   Route: ${reportesMenu[0].route}`);
    } else {
      console.log('❌ Menú de Reportes de Cierre NO encontrado');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkMenu(); 