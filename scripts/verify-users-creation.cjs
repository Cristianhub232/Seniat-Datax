const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function verifyUsersCreation() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar si realmente se crearon usuarios
    console.log('\n🔍 VERIFICANDO CREACIÓN DE USUARIOS:');
    console.log('=' .repeat(50));
    
    // Contar usuarios totales
    const totalUsers = await connection.execute('SELECT COUNT(*) FROM CGBRITO.USERS');
    console.log(`Total de usuarios en tabla USERS: ${totalUsers.rows[0][0]}`);
    
    // Ver todos los usuarios
    const allUsers = await connection.execute(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, r.NAME as role_name, u.STATUS, u.CREATED_AT
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      ORDER BY u.CREATED_AT DESC
    `);
    
    console.log('\n👥 TODOS LOS USUARIOS EN LA BASE DE DATOS:');
    console.log('=' .repeat(50));
    
    allUsers.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row[0]}`);
      console.log(`   Username: ${row[1]}`);
      console.log(`   Email: ${row[2]}`);
      console.log(`   Nombre: ${row[3] || 'N/A'} ${row[4] || 'N/A'}`);
      console.log(`   Rol: ${row[5]}`);
      console.log(`   Estado: ${row[6]}`);
      console.log(`   Creado: ${row[7]}`);
      console.log('');
    });
    
    // Verificar usuarios por rol
    console.log('📊 USUARIOS POR ROL:');
    console.log('=' .repeat(50));
    
    const usersByRole = await connection.execute(`
      SELECT r.NAME as role_name, COUNT(*) as count
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      GROUP BY r.NAME
      ORDER BY r.NAME
    `);
    
    usersByRole.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]} usuarios`);
    });
    
    // Verificar si hay usuarios con email @seniat.gob.ve
    console.log('\n🔍 VERIFICANDO USUARIOS CON EMAIL @seniat.gob.ve:');
    console.log('=' .repeat(50));
    
    const seniatUsers = await connection.execute(`
      SELECT u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, r.NAME as role_name
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.EMAIL LIKE '%@seniat.gob.ve'
      ORDER BY u.USERNAME
    `);
    
    if (seniatUsers.rows.length > 0) {
      console.log(`Usuarios con email @seniat.gob.ve: ${seniatUsers.rows.length}`);
      seniatUsers.rows.forEach(row => {
        console.log(`   - ${row[0]} (${row[1]}) - ${row[2]} ${row[3]} - Rol: ${row[4]}`);
      });
    } else {
      console.log('❌ No se encontraron usuarios con email @seniat.gob.ve');
    }
    
    // Verificar si hay transacciones pendientes
    console.log('\n🔍 VERIFICANDO TRANSACCIONES PENDIENTES:');
    console.log('=' .repeat(50));
    
    const pendingTransactions = await connection.execute(`
      SELECT COUNT(*) FROM v$transaction
    `);
    
    console.log(`Transacciones pendientes: ${pendingTransactions.rows[0][0]}`);
    
    // Verificar si hay locks en las tablas
    console.log('\n🔍 VERIFICANDO LOCKS EN TABLAS:');
    console.log('=' .repeat(50));
    
    try {
      const tableLocks = await connection.execute(`
        SELECT object_name, object_type, status
        FROM user_objects
        WHERE object_name IN ('USERS', 'EJECUTIVOS')
        ORDER BY object_name
      `);
      
      console.log('Estado de las tablas:');
      tableLocks.rows.forEach(row => {
        console.log(`   - ${row[0]} (${row[1]}): ${row[2]}`);
      });
    } catch (error) {
      console.log('❌ Error verificando locks:', error.message);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔒 Conexión a base de datos cerrada');
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  verifyUsersCreation()
    .then(() => {
      console.log('\n✨ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verifyUsersCreation };
