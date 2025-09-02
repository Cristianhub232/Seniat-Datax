const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos principal
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function updateMenuOrder() {
  try {
    console.log('🔍 Actualizando orden del menú...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Obtener el máximo orden actual
    const [maxOrder] = await sequelize.query(`
      SELECT MAX(orden) as max_orden FROM public.menus WHERE orden IS NOT NULL
    `);
    
    const newOrder = (maxOrder[0].max_orden || 0) + 1;
    console.log(`📋 Nuevo orden asignado: ${newOrder}`);

    // Actualizar el menú de reportes de cierre
    const [result] = await sequelize.query(`
      UPDATE public.menus 
      SET orden = ${newOrder}
      WHERE key = 'reportes-cierre'
      RETURNING id, key, label, orden
    `);

    if (result.length > 0) {
      console.log('✅ Menú de Reportes de Cierre actualizado:');
      console.log(`   ID: ${result[0].id}`);
      console.log(`   Key: ${result[0].key}`);
      console.log(`   Label: ${result[0].label}`);
      console.log(`   Nuevo Orden: ${result[0].orden}`);
    } else {
      console.log('❌ No se pudo actualizar el menú');
    }

    // Verificar el nuevo orden
    console.log('\n📋 Menús ordenados:');
    const [menus] = await sequelize.query(`
      SELECT key, label, orden, section, status
      FROM public.menus
      ORDER BY orden ASC NULLS LAST
    `);

    menus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.label} (${menu.key}) - Orden: ${menu.orden || 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

updateMenuOrder(); 