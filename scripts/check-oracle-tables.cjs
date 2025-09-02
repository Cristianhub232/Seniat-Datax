const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function checkTables() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar todas las tablas del usuario
    console.log('📋 Verificando tablas existentes...');
    const tablesResult = await connection.execute(`
      SELECT TABLE_NAME 
      FROM USER_TABLES 
      ORDER BY TABLE_NAME
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tablas encontradas:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row[0]}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas');
    }
    
    // Verificar tablas específicas de autenticación
    console.log('\n🔍 Verificando tablas de autenticación...');
    const authTables = ['USERS', 'ROLES', 'PERMISSIONS', 'SESSIONS', 'AUDIT_LOGS', 'MENUS', 'NOTIFICATIONS'];
    
    for (const tableName of authTables) {
      try {
        const result = await connection.execute(`
          SELECT COUNT(*) as COUNT FROM ${tableName}
        `);
        console.log(`   ✅ ${tableName}: ${result.rows[0][0]} registros`);
      } catch (error) {
        console.log(`   ❌ ${tableName}: No existe`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Conexión cerrada');
      } catch (error) {
        console.error('Error cerrando conexión:', error.message);
      }
    }
  }
}

checkTables(); 