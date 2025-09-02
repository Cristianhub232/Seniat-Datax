const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔌 Probando conexión a Oracle...');
    console.log('📋 Configuración:');
    console.log(`   Host: 172.16.32.73`);
    console.log(`   Puerto: 1521`);
    console.log(`   Base de datos: DWREPO`);
    console.log(`   Usuario: CGBRITO`);
    console.log(`   Esquema: CGBRITO`);
    
    // Intentar conexión
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar esquema
    console.log('🔍 Verificando esquema CGBRITO...');
    const result = await connection.execute(
      'SELECT USER FROM DUAL'
    );
    console.log('✅ Usuario actual:', result.rows[0][0]);
    
    // Verificar tablas existentes
    console.log('📋 Verificando tablas existentes...');
    const tablesResult = await connection.execute(`
      SELECT TABLE_NAME 
      FROM USER_TABLES 
      WHERE TABLE_NAME IN ('USERS', 'ROLES', 'PERMISSIONS', 'SESSIONS', 'AUDIT_LOGS')
      ORDER BY TABLE_NAME
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tablas encontradas:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row[0]}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas de autenticación');
      console.log('💡 Ejecuta: node scripts/create-oracle-tables.cjs');
    }
    
    // Verificar usuarios existentes
    console.log('👥 Verificando usuarios existentes...');
    try {
      const usersResult = await connection.execute(`
        SELECT USERNAME, EMAIL, FIRST_NAME, LAST_NAME 
        FROM USERS 
        WHERE ROWNUM <= 5
      `);
      
      if (usersResult.rows.length > 0) {
        console.log('✅ Usuarios encontrados:');
        usersResult.rows.forEach(row => {
          console.log(`   - ${row[0]} (${row[1]}) - ${row[2]} ${row[3]}`);
        });
      } else {
        console.log('⚠️  No se encontraron usuarios');
      }
    } catch (error) {
      console.log('⚠️  No se pudo verificar usuarios (tabla no existe)');
    }
    
    console.log('\n🎉 Prueba de conexión completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('💡 Verifica:');
    console.error('   1. Que el servidor Oracle esté ejecutándose');
    console.error('   2. Que las credenciales sean correctas');
    console.error('   3. Que el usuario CGBRITO tenga permisos de conexión');
    console.error('   4. Que el esquema CGBRITO exista');
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

testConnection(); 