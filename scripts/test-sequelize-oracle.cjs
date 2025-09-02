const { Sequelize } = require('sequelize');

// Configuración Oracle
const sequelize = new Sequelize({
  dialect: 'oracle',
  host: '172.16.32.73',
  port: 1521,
  database: 'DWREPO',
  username: 'CGBRITO',
  password: 'cgkbrito',
  logging: console.log,
  dialectOptions: {
    connectString: '172.16.32.73:1521/DWREPO',
    schema: 'CGBRITO'
  }
});

async function testSequelize() {
  try {
    console.log('🔌 Probando conexión Sequelize con Oracle...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Probar consulta simple
    console.log('📋 Probando consulta simple...');
    const [results] = await sequelize.query('SELECT COUNT(*) as COUNT FROM CGBRITO.USERS');
    console.log('Usuarios en la base de datos:', results[0].COUNT);
    
    // Probar consulta con JOIN
    console.log('📋 Probando consulta con JOIN...');
    const [users] = await sequelize.query(`
      SELECT u.USERNAME, u.EMAIL, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = 'admin'
    `);
    
    if (users.length > 0) {
      console.log('✅ Usuario admin encontrado:', users[0]);
    } else {
      console.log('❌ Usuario admin no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

testSequelize(); 