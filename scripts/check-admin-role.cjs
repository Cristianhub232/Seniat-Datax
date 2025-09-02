const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function checkAdminRole() {
  let connection;
  
  try {
    // Configuración de conexión usando las variables correctas
    const config = {
      user: process.env.ORACLE_USERNAME || 'CGBRITO',
      password: process.env.ORACLE_PASSWORD || 'cgkbrito',
      connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`,
    };

    console.log('🔍 Conectando a Oracle...');
    console.log('📍 Host:', process.env.ORACLE_HOST);
    console.log('📍 Puerto:', process.env.ORACLE_PORT);
    console.log('📍 Base de datos:', process.env.ORACLE_DATABASE);
    console.log('📍 Usuario:', process.env.ORACLE_USERNAME);
    
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa');

    // Consultar el rol del usuario admin
    const result = await connection.execute(`
      SELECT u.ID, u.USERNAME, u.EMAIL, r.ID as ROLE_ID, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = 'admin'
    `);

    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0];
      console.log('👤 Usuario admin encontrado:');
      console.log(`   ID: ${user[0]}`);
      console.log(`   Username: ${user[1]}`);
      console.log(`   Email: ${user[2]}`);
      console.log(`   Role ID: ${user[3]}`);
      console.log(`   Role Name: ${user[4]}`);
      console.log(`   Role Name (lowercase): ${user[4]?.toLowerCase()}`);
    } else {
      console.log('❌ Usuario admin no encontrado');
    }

    // También verificar todos los roles disponibles
    const rolesResult = await connection.execute(`
      SELECT ID, NAME, DESCRIPTION
      FROM CGBRITO.ROLES
      ORDER BY NAME
    `);

    console.log('\n📋 Roles disponibles:');
    if (rolesResult.rows && rolesResult.rows.length > 0) {
      rolesResult.rows.forEach(role => {
        console.log(`   - ${role[1]} (ID: ${role[0]}, Desc: ${role[2] || 'Sin descripción'})`);
      });
    } else {
      console.log('   No hay roles disponibles');
    }

    // Verificar todos los usuarios disponibles
    const usersResult = await connection.execute(`
      SELECT u.ID, u.USERNAME, u.EMAIL, r.NAME as ROLE_NAME, u.STATUS
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      ORDER BY u.USERNAME
    `);

    console.log('\n👥 Usuarios disponibles:');
    if (usersResult.rows && usersResult.rows.length > 0) {
      usersResult.rows.forEach(user => {
        console.log(`   - ${user[1]} (ID: ${user[0]}, Role: ${user[3] || 'Sin rol'}, Status: ${user[4]})`);
      });
    } else {
      console.log('   No hay usuarios disponibles');
    }

    // Verificar la estructura de la tabla USERS
    console.log('\n🔍 Estructura de la tabla USERS:');
    const structureResult = await connection.execute(`
      SELECT column_name, data_type, nullable, data_default
      FROM user_tab_columns 
      WHERE table_name = 'USERS' 
      ORDER BY column_id
    `);
    
    if (structureResult.rows && structureResult.rows.length > 0) {
      structureResult.rows.forEach(col => {
        console.log(`   - ${col[0]} (${col[1]}, ${col[2] === 'Y' ? 'NULL' : 'NOT NULL'})`);
      });
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

checkAdminRole(); 