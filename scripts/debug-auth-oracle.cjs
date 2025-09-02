const oracledb = require('oracledb');
const bcrypt = require('bcrypt');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function debugAuth() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar usuario admin
    console.log('\n🔍 Verificando usuario admin...');
    const adminUser = await connection.execute(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.PASSWORD_HASH, u.FIRST_NAME, u.LAST_NAME, 
             u.ROLE_ID, u.STATUS, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = :username
    `, ['admin']);
    
    if (adminUser.rows.length === 0) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    const user = adminUser.rows[0];
    console.log('✅ Usuario admin encontrado:');
    console.log('   ID:', user[0]);
    console.log('   Username:', user[1]);
    console.log('   Email:', user[2]);
    console.log('   First Name:', user[4]);
    console.log('   Last Name:', user[5]);
    console.log('   Role ID:', user[6]);
    console.log('   Status:', user[7]);
    console.log('   Role Name:', user[8]);
    
    // Verificar contraseña
    console.log('\n🔐 Verificando contraseña...');
    try {
      const isValidPassword = await bcrypt.compare('admin123', user[3]);
      console.log('   Contraseña válida:', isValidPassword ? 'Sí' : 'No');
    } catch (error) {
      console.log('   Error verificando contraseña:', error.message);
    }
    
    // Verificar permisos del rol
    console.log('\n🔑 Verificando permisos del rol...');
    const permissions = await connection.execute(`
      SELECT p.NAME, p.DESCRIPTION, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
    `, [user[6]]);
    
    console.log(`   Permisos encontrados: ${permissions.rows.length}`);
    permissions.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]} (${row[2]}.${row[3]})`);
    });
    
    // Verificar estructura de tablas
    console.log('\n📋 Verificando estructura de tablas...');
    const tables = ['USERS', 'ROLES', 'PERMISSIONS', 'ROLE_PERMISSIONS', 'SESSIONS', 'AUDIT_LOGS'];
    
    for (const tableName of tables) {
      try {
        const result = await connection.execute(`
          SELECT COUNT(*) as COUNT FROM CGBRITO.${tableName}
        `);
        console.log(`   ✅ ${tableName}: ${result.rows[0][0]} registros`);
      } catch (error) {
        console.log(`   ❌ ${tableName}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
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

debugAuth(); 