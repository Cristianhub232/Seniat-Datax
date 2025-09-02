const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'oracle',
  host: '172.16.32.73',
  port: 1521,
  database: 'DWREPO',
  username: 'CGBRITO',
  password: 'cgkbrito',
  logging: false
});

async function checkMenusStructure() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar estructura de la tabla MENUS
    console.log('\n1️⃣ Verificando estructura de la tabla MENUS...');
    const tableStructure = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE, DATA_DEFAULT
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = 'MENUS'
      ORDER BY COLUMN_ID
    `, { type: 'SELECT' });
    
    console.log('📋 Estructura de la tabla MENUS:');
    tableStructure.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.DATA_LENGTH ? '(' + col.DATA_LENGTH + ')' : ''}) ${col.NULLABLE === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. Verificar datos existentes
    console.log('\n2️⃣ Verificando datos existentes...');
    const existingMenus = await sequelize.query(`
      SELECT * FROM CGBRITO.MENUS
    `, { type: 'SELECT' });
    
    console.log(`📊 Menús existentes: ${existingMenus.length}`);
    
    if (existingMenus.length > 0) {
      console.log('\n🍽️ Menús en la base de datos:');
      existingMenus.forEach((menu, index) => {
        console.log(`   ${index + 1}. ID: ${menu.ID}, Nombre: ${menu.NAME || 'N/A'}`);
        // Mostrar solo las columnas que existen
        Object.keys(menu).forEach(key => {
          if (key !== 'ID' && menu[key] !== null) {
            console.log(`      ${key}: ${menu[key]}`);
          }
        });
        console.log('');
      });
    }
    
    // 3. Verificar si hay menús para el rol ejecutivo
    console.log('\n3️⃣ Verificando menús para el rol ejecutivo...');
    try {
      const ejecutivoMenus = await sequelize.query(`
        SELECT m.* FROM CGBRITO.MENUS m
        JOIN CGBRITO.ROLE_MENU_PERMISSIONS rmp ON m.ID = rmp.MENU_ID
        JOIN CGBRITO.ROLES r ON rmp.ROLE_ID = r.ID
        WHERE r.NAME = 'Ejecutivo'
      `, { type: 'SELECT' });
      
      console.log(`📊 Menús del rol ejecutivo: ${ejecutivoMenus.length}`);
      
      if (ejecutivoMenus.length > 0) {
        console.log('\n🔐 Menús asignados al ejecutivo:');
        ejecutivoMenus.forEach((menu, index) => {
          console.log(`   ${index + 1}. ${menu.NAME || 'N/A'}`);
        });
      }
    } catch (error) {
      console.log('⚠️ No se pudo verificar menús del rol ejecutivo:', error.message);
    }
    
    console.log('\n🎉 Verificación de estructura completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkMenusStructure();
