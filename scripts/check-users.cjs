const oracledb = require('oracledb');

async function checkUsers() {
  let connection;
  
  try {
    // Configuración de conexión
    const config = {
      user: process.env.ORACLE_USERNAME || 'ont',
      password: process.env.ORACLE_PASSWORD || 'ont',
      connectString: `${process.env.ORACLE_HOST || 'localhost'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'xe'}`,
    };

    console.log('🔍 Conectando a Oracle...');
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa');

    // Consultar usuarios
    console.log('\n🔍 Verificando usuarios...');
    const usersResult = await connection.execute(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.ROLE_ID, u.STATUS, u.CREATED_AT, u.UPDATED_AT,
             r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      ORDER BY u.CREATED_AT DESC
    `);

    console.log('📋 Usuarios encontrados:', usersResult.rows ? usersResult.rows.length : 0);
    
    if (usersResult.rows && usersResult.rows.length > 0) {
      usersResult.rows.forEach((user, index) => {
        console.log(`\n👤 Usuario ${index + 1}:`);
        console.log(`   ID: ${user[0]}`);
        console.log(`   Username: ${user[1]}`);
        console.log(`   Email: ${user[2]}`);
        console.log(`   Role ID: ${user[3]}`);
        console.log(`   Status: ${user[4]}`);
        console.log(`   Created: ${user[5]}`);
        console.log(`   Updated: ${user[6]}`);
        console.log(`   Role Name: ${user[7]}`);
      });
    } else {
      console.log('❌ No se encontraron usuarios');
    }

    // También verificar la tabla de roles
    console.log('\n🔍 Verificando roles...');
    const rolesResult = await connection.execute(`
      SELECT ID, NAME, DESCRIPTION, STATUS, CREATED_AT, UPDATED_AT
      FROM CGBRITO.ROLES
      ORDER BY NAME
    `);

    console.log('📋 Roles encontrados:', rolesResult.rows ? rolesResult.rows.length : 0);
    
    if (rolesResult.rows && rolesResult.rows.length > 0) {
      rolesResult.rows.forEach((role, index) => {
        console.log(`\n🎭 Rol ${index + 1}:`);
        console.log(`   ID: ${role[0]}`);
        console.log(`   Name: ${role[1]}`);
        console.log(`   Description: ${role[2]}`);
        console.log(`   Status: ${role[3]}`);
        console.log(`   Created: ${role[4]}`);
        console.log(`   Updated: ${role[5]}`);
      });
    } else {
      console.log('❌ No se encontraron roles');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Conexión cerrada');
      } catch (error) {
        console.error('Error cerrando conexión:', error);
      }
    }
  }
}

checkUsers(); 