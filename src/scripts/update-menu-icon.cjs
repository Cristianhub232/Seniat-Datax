const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos principal
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function updateMenuIcon() {
  try {
    console.log('🔍 Actualizando icono del menú de Reportes de Cierre...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Actualizar el icono a uno más llamativo
    const [result] = await sequelize.query(`
      UPDATE public.menus 
      SET icon = 'IconReportMoney'
      WHERE key = 'reportes-cierre'
      RETURNING id, key, label, icon
    `);

    if (result.length > 0) {
      console.log('✅ Icono actualizado correctamente:');
      console.log(`   ID: ${result[0].id}`);
      console.log(`   Key: ${result[0].key}`);
      console.log(`   Label: ${result[0].label}`);
      console.log(`   Nuevo Icono: ${result[0].icon}`);
    } else {
      console.log('❌ No se pudo actualizar el icono');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

updateMenuIcon(); 