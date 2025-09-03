const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function checkAuthData() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USERNAME || 'CGBRITO',
      password: process.env.ORACLE_PASSWORD || 'cgkbrito',
      connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`
    });
    
    console.log('✅ Conexión exitosa a Oracle\n');
    
    // Revisar roles existentes
    console.log('👥 ROLES existentes:');
    try {
      const rolesResult = await connection.execute(
        `SELECT ID, NAME, DESCRIPTION, IS_ACTIVE, CREATED_AT 
         FROM ROLES 
         ORDER BY ID`
      );
      
      if (rolesResult.rows && rolesResult.rows.length > 0) {
        rolesResult.rows.forEach(row => {
          console.log(`   ${row[0]}. ${row[1]} - ${row[2] || 'Sin descripción'} (Activo: ${row[3] ? 'Sí' : 'No'})`);
        });
      } else {
        console.log('   ❌ No hay roles');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando roles: ${error.message}`);
    }
    
    // Revisar usuarios existentes
    console.log('\n👤 USUARIOS existentes:');
    try {
      const usersResult = await connection.execute(
        `SELECT u.ID, u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, u.STATUS, r.NAME as ROLE_NAME
         FROM USERS u
         LEFT JOIN ROLES r ON u.ROLE_ID = r.ID
         ORDER BY u.USERNAME`
      );
      
      if (usersResult.rows && usersResult.rows.length > 0) {
        usersResult.rows.forEach(row => {
          console.log(`   ${row[0]} - ${row[1]} (${row[2]}) - ${row[3] || ''} ${row[4] || ''} - ${row[5] || 'Sin estado'} - Rol: ${row[6] || 'Sin rol'}`);
        });
      } else {
        console.log('   ❌ No hay usuarios');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando usuarios: ${error.message}`);
    }
    
    // Revisar permisos existentes
    console.log('\n🔐 PERMISOS existentes:');
    try {
      const permissionsResult = await connection.execute(
        `SELECT ID, NAME, RESOURCE_NAME, ACTION_NAME, DESCRIPTION
         FROM PERMISSIONS 
         ORDER BY RESOURCE_NAME, ACTION_NAME`
      );
      
      if (permissionsResult.rows && permissionsResult.rows.length > 0) {
        permissionsResult.rows.forEach(row => {
          console.log(`   ${row[0]}. ${row[1]} (${row[2]}.${row[3]}) - ${row[4] || 'Sin descripción'}`);
        });
      } else {
        console.log('   ❌ No hay permisos');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando permisos: ${error.message}`);
    }
    
    // Revisar menús existentes
    console.log('\n📋 MENÚS existentes:');
    try {
      const menusResult = await connection.execute(
        `SELECT ID, TITLE, URL, ICON, PARENT_ID, ORDER_INDEX
         FROM MENUS 
         ORDER BY PARENT_ID NULLS FIRST, ORDER_INDEX`
      );
      
      if (menusResult.rows && menusResult.rows.length > 0) {
        menusResult.rows.forEach(row => {
          const parentInfo = row[4] ? ` (Padre: ${row[4]})` : ' (Raíz)';
          console.log(`   ${row[0]}. ${row[1]} - ${row[2]} - ${row[3] || 'Sin icono'}${parentInfo} - Orden: ${row[5] || 'Sin orden'}`);
        });
      } else {
        console.log('   ❌ No hay menús');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando menús: ${error.message}`);
    }
    
    // Revisar permisos por rol
    console.log('\n🔗 PERMISOS POR ROL:');
    try {
      const rolePermissionsResult = await connection.execute(
        `SELECT r.NAME as ROLE_NAME, p.NAME as PERMISSION_NAME, p.RESOURCE_NAME, p.ACTION_NAME
         FROM ROLES r
         LEFT JOIN ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
         LEFT JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID
         ORDER BY r.NAME, p.RESOURCE_NAME, p.ACTION_NAME`
      );
      
      if (rolePermissionsResult.rows && rolePermissionsResult.rows.length > 0) {
        let currentRole = '';
        rolePermissionsResult.rows.forEach(row => {
          if (row[0] !== currentRole) {
            currentRole = row[0];
            console.log(`\n   🎭 ${currentRole}:`);
          }
          if (row[1]) {
            console.log(`      - ${row[1]} (${row[2]}.${row[3]})`);
          } else {
            console.log(`      - Sin permisos asignados`);
          }
        });
      } else {
        console.log('   ❌ No hay permisos asignados a roles');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando permisos por rol: ${error.message}`);
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

checkAuthData();
