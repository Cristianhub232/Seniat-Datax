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

async function checkRoleMenuStructure() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar estructura de ROLE_MENU_PERMISSIONS
    console.log('\n1️⃣ Verificando estructura de ROLE_MENU_PERMISSIONS...');
    const tableStructure = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE, DATA_DEFAULT
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = 'ROLE_MENU_PERMISSIONS'
      ORDER BY COLUMN_ID
    `, { type: 'SELECT' });
    
    console.log('📋 Estructura de ROLE_MENU_PERMISSIONS:');
    tableStructure.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.DATA_LENGTH ? '(' + col.DATA_LENGTH + ')' : ''}) ${col.NULLABLE === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. Verificar datos existentes
    console.log('\n2️⃣ Verificando datos existentes...');
    const existingData = await sequelize.query(`
      SELECT * FROM CGBRITO.ROLE_MENU_PERMISSIONS
    `, { type: 'SELECT' });
    
    console.log(`📊 Registros existentes: ${existingData.length}`);
    
    if (existingData.length > 0) {
      console.log('\n🔗 Relaciones existentes:');
      existingData.forEach((rel, index) => {
        console.log(`   ${index + 1}. ID: ${rel.ID}, Role ID: ${rel.ROLE_ID}, Menu ID: ${rel.MENU_ID}`);
        // Mostrar solo las columnas que existen
        Object.keys(rel).forEach(key => {
          if (!['ID', 'ROLE_ID', 'MENU_ID'].includes(key) && rel[key] !== null) {
            console.log(`      ${key}: ${rel[key]}`);
          }
        });
        console.log('');
      });
    }
    
    // 3. Verificar menús del ejecutivo actualmente
    console.log('\n3️⃣ Verificando menús del ejecutivo actualmente...');
    try {
      const ejecutivoMenus = await sequelize.query(`
        SELECT m.NAME, m.PATH, m.ICON
        FROM CGBRITO.MENUS m
        JOIN CGBRITO.ROLE_MENU_PERMISSIONS rmp ON m.ID = rmp.MENU_ID
        JOIN CGBRITO.ROLES r ON rmp.ROLE_ID = r.ID
        WHERE r.NAME = 'Ejecutivo'
      `, { type: 'SELECT' });
      
      console.log(`📊 Menús del ejecutivo: ${ejecutivoMenus.length}`);
      
      if (ejecutivoMenus.length > 0) {
        console.log('\n🔐 Menús asignados al ejecutivo:');
        ejecutivoMenus.forEach((menu, index) => {
          console.log(`   ${index + 1}. ${menu.NAME} (${menu.PATH})`);
        });
      }
    } catch (error) {
      console.log('⚠️ Error verificando menús del ejecutivo:', error.message);
    }
    
    console.log('\n🎉 Verificación de estructura completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkRoleMenuStructure();
