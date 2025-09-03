const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function checkUsersTable() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar estructura de la tabla USERS
    console.log('\n📋 ESTRUCTURA DE LA TABLA USERS:');
    console.log('=' .repeat(50));
    
    const userStructure = await connection.execute(`
      SELECT column_name, data_type, data_length, nullable
      FROM user_tab_columns 
      WHERE table_name = 'USERS'
      ORDER BY column_id
    `);
    
    console.log('Columnas de la tabla USERS:');
    userStructure.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]}(${row[2]}) ${row[3] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Contar total de usuarios
    console.log('\n📊 CONTENIDO DE LA TABLA USERS:');
    console.log('=' .repeat(50));
    
    const totalUsers = await connection.execute('SELECT COUNT(*) FROM CGBRITO.USERS');
    console.log(`Total de usuarios: ${totalUsers.rows[0][0]}`);
    
    // Ver usuarios por rol
    const usersByRole = await connection.execute(`
      SELECT r.NAME as role_name, COUNT(*) as count
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      GROUP BY r.NAME
      ORDER BY r.NAME
    `);
    
    console.log('\nUsuarios por rol:');
    usersByRole.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]}`);
    });
    
    // Ver algunos usuarios de ejemplo
    console.log('\n👥 EJEMPLOS DE USUARIOS:');
    console.log('=' .repeat(50));
    
    const sampleUsers = await connection.execute(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, r.NAME as role_name, u.STATUS
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      ORDER BY u.CREATED_AT DESC
      FETCH FIRST 10 ROWS ONLY
    `);
    
    sampleUsers.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row[0]}`);
      console.log(`   Username: ${row[1]}`);
      console.log(`   Email: ${row[2]}`);
      console.log(`   Nombre: ${row[3] || 'N/A'} ${row[4] || 'N/A'}`);
      console.log(`   Rol: ${row[5]}`);
      console.log(`   Estado: ${row[6]}`);
      console.log('');
    });
    
    // Verificar si hay usuarios con email de ejecutivos
    console.log('🔍 VERIFICANDO USUARIOS CON EMAIL DE EJECUTIVOS:');
    console.log('=' .repeat(50));
    
    const ejecutivosUsers = await connection.execute(`
      SELECT u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, r.NAME as role_name
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.EMAIL LIKE '%@seniat.gob.ve'
      ORDER BY u.USERNAME
    `);
    
    if (ejecutivosUsers.rows.length > 0) {
      console.log(`Usuarios con email @seniat.gob.ve: ${ejecutivosUsers.rows.length}`);
      ejecutivosUsers.rows.forEach(row => {
        console.log(`   - ${row[0]} (${row[1]}) - ${row[2]} ${row[3]} - Rol: ${row[4]}`);
      });
    } else {
      console.log('❌ No se encontraron usuarios con email @seniat.gob.ve');
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
  checkUsersTable()
    .then(() => {
      console.log('\n✨ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { checkUsersTable };
