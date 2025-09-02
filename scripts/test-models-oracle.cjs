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

async function testModels() {
  try {
    console.log('🔌 Probando modelos con Oracle...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Probar consulta directa a la tabla USERS
    console.log('📋 Probando tabla USERS...');
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
    
    // Probar consulta a la tabla ROLES
    console.log('📋 Probando tabla ROLES...');
    const [roles] = await sequelize.query('SELECT ID, NAME FROM CGBRITO.ROLES');
    console.log('Roles encontrados:', roles.length);
    roles.forEach(role => {
      console.log(`   - ${role.NAME} (ID: ${role.ID})`);
    });
    
    // Probar consulta a la tabla PERMISSIONS
    console.log('📋 Probando tabla PERMISSIONS...');
    const [permissions] = await sequelize.query('SELECT ID, NAME FROM CGBRITO.PERMISSIONS WHERE ROWNUM <= 5');
    console.log('Permisos encontrados:', permissions.length);
    permissions.forEach(perm => {
      console.log(`   - ${perm.NAME} (ID: ${perm.ID})`);
    });
    
    // Probar consulta a la tabla ROLE_PERMISSIONS
    console.log('📋 Probando tabla ROLE_PERMISSIONS...');
    const [rolePermissions] = await sequelize.query(`
      SELECT r.NAME as ROLE_NAME, p.NAME as PERMISSION_NAME
      FROM CGBRITO.ROLE_PERMISSIONS rp
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      JOIN CGBRITO.PERMISSIONS p ON rp.PERMISSION_ID = p.ID
      WHERE r.NAME = 'ADMIN'
      AND ROWNUM <= 5
    `);
    console.log('Permisos del rol ADMIN:', rolePermissions.length);
    rolePermissions.forEach(rp => {
      console.log(`   - ${rp.ROLE_NAME}: ${rp.PERMISSION_NAME}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

testModels(); 