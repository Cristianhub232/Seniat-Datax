require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
const { Sequelize } = require('sequelize');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function moveBancosToNormal() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Primero, obtener el orden actual de los menús
    console.log('📊 Verificando orden actual de menús...');
    const [currentMenus] = await sequelize.query(`
      SELECT id, key, label, orden, section
      FROM public.menus 
      WHERE status = true 
      ORDER BY orden ASC
    `);

    console.log('📋 Menús actuales:');
    currentMenus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.label} (${menu.key}) - Orden: ${menu.orden} - Sección: ${menu.section}`);
    });

    // Buscar el menú de bancos
    const bancosMenu = currentMenus.find(menu => menu.key === 'consulta-bancos');
    
    if (!bancosMenu) {
      console.log('❌ No se encontró el menú de bancos');
      return;
    }

    console.log(`\n🎯 Menú de bancos encontrado: ${bancosMenu.label} (Orden: ${bancosMenu.orden})`);

    // Obtener el orden máximo de los módulos normales (antes de reportes de cierre)
    const reportesCierreMenu = currentMenus.find(menu => menu.key === 'reportes-cierre');
    
    if (!reportesCierreMenu) {
      console.log('❌ No se encontró el menú de reportes de cierre');
      return;
    }

    console.log(`📊 Menú de reportes de cierre: ${reportesCierreMenu.label} (Orden: ${reportesCierreMenu.orden})`);

    // Calcular el nuevo orden para bancos (justo antes de reportes de cierre)
    const newOrder = reportesCierreMenu.orden;
    
    // Mover todos los menús que están después de bancos hacia arriba
    console.log('\n🔄 Reorganizando menús...');
    
    // Primero, mover bancos al nuevo orden
    await sequelize.query(`
      UPDATE public.menus 
      SET orden = $1 
      WHERE key = 'consulta-bancos'
    `, { bind: [newOrder] });

    // Luego, ajustar el orden de los demás menús
    const menusToUpdate = currentMenus.filter(menu => 
      menu.key !== 'consulta-bancos' && 
      menu.orden >= newOrder
    );

    for (const menu of menusToUpdate) {
      const newMenuOrder = menu.orden + 1;
      await sequelize.query(`
        UPDATE public.menus 
        SET orden = $1 
        WHERE key = $2
      `, { bind: [newMenuOrder, menu.key] });
      
      console.log(`   📝 ${menu.label}: ${menu.orden} → ${newMenuOrder}`);
    }

    // Verificar el resultado
    console.log('\n📊 Verificando nuevo orden de menús...');
    const [updatedMenus] = await sequelize.query(`
      SELECT id, key, label, orden, section
      FROM public.menus 
      WHERE status = true 
      ORDER BY orden ASC
    `);

    console.log('📋 Nuevo orden de menús:');
    updatedMenus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.label} (${menu.key}) - Orden: ${menu.orden} - Sección: ${menu.section}`);
    });

    console.log('\n✅ Menú de bancos movido exitosamente a módulos normales');
    console.log('🎯 Ahora "Consulta de Bancos" aparece antes de "Reportes de Cierre"');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

moveBancosToNormal(); 