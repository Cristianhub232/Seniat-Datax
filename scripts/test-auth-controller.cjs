const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const databaseUrl = 'postgresql://ont:123456@localhost:5432/xmls';

// Crear conexión con esquema específico
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: console.log, // Habilitar logging para ver las consultas SQL
  schema: 'app'
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Verificar que las tablas existen
    console.log('\n📋 Verificando tablas en esquema app...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'app' 
      ORDER BY table_name;
    `);
    
    console.log('Tablas encontradas:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Verificar usuarios
    console.log('\n👥 Verificando usuarios...');
    const [users] = await sequelize.query(`
      SELECT u.username, u.email, r.name as role_name
      FROM app.users u
      LEFT JOIN app.roles r ON u.role_id = r.id
      LIMIT 5;
    `);
    
    console.log('Usuarios encontrados:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Rol: ${user.role_name}`);
    });
    
    // Verificar roles
    console.log('\n🎭 Verificando roles...');
    const [roles] = await sequelize.query(`
      SELECT name, status FROM app.roles;
    `);
    
    console.log('Roles encontrados:');
    roles.forEach(role => {
      console.log(`  - ${role.name} (${role.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection(); 