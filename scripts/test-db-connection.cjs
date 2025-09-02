const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const dbConfig = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

async function testConnection() {
  const sequelize = new Sequelize(dbConfig);
  
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar esquema app
    const [schemas] = await sequelize.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'app';");
    if (schemas.length > 0) {
      console.log('✅ Esquema app encontrado');
    } else {
      console.log('❌ Esquema app no encontrado');
      return;
    }
    
    // Verificar tablas en esquema app
    const tables = ['roles', 'users', 'menus', 'role_menu_permissions'];
    
    for (const table of tables) {
      const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM app.${table};`);
      console.log(`📊 Tabla ${table}: ${result[0].count} registros`);
    }
    
    // Verificar usuario admin
    const [adminUser] = await sequelize.query("SELECT username, email FROM app.users WHERE username = 'admin';");
    if (adminUser.length > 0) {
      console.log(`✅ Usuario admin encontrado: ${adminUser[0].username} (${adminUser[0].email})`);
    } else {
      console.log('❌ Usuario admin no encontrado');
    }
    
    console.log('\n🎉 Todas las verificaciones completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la conexión:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection(); 