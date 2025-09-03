const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function checkAuthStructure() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USERNAME || 'CGBRITO',
      password: process.env.ORACLE_PASSWORD || 'cgkbrito',
      connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`
    });
    
    console.log('✅ Conexión exitosa a Oracle\n');
    
    // Revisar estructura de la tabla ROLES
    console.log('📋 Estructura de la tabla ROLES:');
    try {
      const rolesResult = await connection.execute(
        `SELECT column_name, data_type, data_length, nullable, data_default 
         FROM user_tab_columns 
         WHERE table_name = 'ROLES' 
         ORDER BY column_id`
      );
      
      if (rolesResult.rows && rolesResult.rows.length > 0) {
        rolesResult.rows.forEach(row => {
          console.log(`   ${row[0]} (${row[1]}${row[2] ? '(' + row[2] + ')' : ''}) ${row[3] === 'N' ? 'NOT NULL' : 'NULL'}`);
        });
      } else {
        console.log('   ❌ Tabla ROLES no encontrada');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando ROLES: ${error.message}`);
    }
    
    console.log('\n📋 Estructura de la tabla USERS:');
    try {
      const usersResult = await connection.execute(
        `SELECT column_name, data_type, data_length, nullable, data_default 
         FROM user_tab_columns 
         WHERE table_name = 'USERS' 
         ORDER BY column_id`
      );
      
      if (usersResult.rows && usersResult.rows.length > 0) {
        usersResult.rows.forEach(row => {
          console.log(`   ${row[0]} (${row[1]}${row[2] ? '(' + row[2] + ')' : ''}) ${row[3] === 'N' ? 'NOT NULL' : 'NULL'}`);
        });
      } else {
        console.log('   ❌ Tabla USERS no encontrada');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando USERS: ${error.message}`);
    }
    
    console.log('\n📋 Estructura de la tabla PERMISSIONS:');
    try {
      const permissionsResult = await connection.execute(
        `SELECT column_name, data_type, data_length, nullable, data_default 
         FROM user_tab_columns 
         WHERE table_name = 'PERMISSIONS' 
         ORDER BY column_id`
      );
      
      if (permissionsResult.rows && permissionsResult.rows.length > 0) {
        permissionsResult.rows.forEach(row => {
          console.log(`   ${row[0]} (${row[1]}${row[2] ? '(' + row[2] + ')' : ''}) ${row[3] === 'N' ? 'NOT NULL' : 'NULL'}`);
        });
      } else {
        console.log('   ❌ Tabla PERMISSIONS no encontrada');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando PERMISSIONS: ${error.message}`);
    }
    
    // Revisar datos en las tablas
    console.log('\n📊 Datos en las tablas:');
    
    const tables = ['ROLES', 'USERS', 'PERMISSIONS', 'SESSIONS', 'MENUS'];
    
    for (const table of tables) {
      try {
        const countResult = await connection.execute(`SELECT COUNT(*) as total FROM ${table}`);
        const count = countResult.rows[0][0];
        console.log(`   ${table}: ${count} filas`);
      } catch (error) {
        console.log(`   ${table}: ❌ Error - ${error.message}`);
      }
    }
    
    // Revisar restricciones
    console.log('\n🔒 Restricciones de integridad:');
    try {
      const constraintsResult = await connection.execute(
        `SELECT constraint_name, constraint_type, table_name, search_condition 
         FROM user_constraints 
         WHERE table_name IN ('ROLES', 'USERS', 'PERMISSIONS', 'SESSIONS', 'MENUS')
         ORDER BY table_name, constraint_type`
      );
      
      if (constraintsResult.rows && constraintsResult.rows.length > 0) {
        constraintsResult.rows.forEach(row => {
          console.log(`   ${row[0]} (${row[1]}) en ${row[2]}`);
        });
      } else {
        console.log('   No se encontraron restricciones');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando restricciones: ${error.message}`);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\n🔌 Conexión cerrada');
      } catch (error) {
        console.error('Error cerrando conexión:', error.message);
      }
    }
  }
}

checkAuthStructure();
