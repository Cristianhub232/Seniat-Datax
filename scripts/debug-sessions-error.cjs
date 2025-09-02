const oracledb = require('oracledb');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

async function debugSessionsError() {
  let connection;
  
  try {
    // Configuración de conexión
    const config = {
      user: process.env.ORACLE_USERNAME || 'CGBRITO',
      password: process.env.ORACLE_PASSWORD || 'cgkbrito',
      connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`,
    };

    console.log('🔍 Conectando a Oracle...');
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa');

    // Simular exactamente lo que hace el controlador
    console.log('\n🧪 Simulando inserción de sesión...');
    
    // Generar datos como lo hace el controlador
    const sessionId = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update('test-token').digest('hex');
    const userId = '46523374-85ac-4af7-af7f-d2aa70c4615a'; // ID del admin
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ipAddress = '127.0.0.1';
    const userAgent = 'test-user-agent';

    console.log('📋 Datos generados:');
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Token Hash: ${tokenHash}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Expires At: ${expiresAt}`);
    console.log(`   IP Address: ${ipAddress}`);
    console.log(`   User Agent: ${userAgent}`);

    // Verificar si ya existe una sesión con este token hash
    console.log('\n🔍 Verificando si ya existe una sesión con este token hash...');
    const existingSession = await connection.execute(`
      SELECT ID, USER_ID, TOKEN_HASH, EXPIRES_AT
      FROM CGBRITO.SESSIONS
      WHERE TOKEN_HASH = :tokenHash
    `, { tokenHash });

    if (existingSession.rows && existingSession.rows.length > 0) {
      console.log('❌ Ya existe una sesión con este token hash:');
      existingSession.rows.forEach(session => {
        console.log(`   - ID: ${session[0]}`);
        console.log(`   - User ID: ${session[1]}`);
        console.log(`   - Token Hash: ${session[2]?.substring(0, 20)}...`);
        console.log(`   - Expires At: ${session[3]}`);
      });
    } else {
      console.log('✅ No hay sesiones duplicadas con este token hash');
    }

    // Verificar si ya existe una sesión para este usuario
    console.log('\n🔍 Verificando si ya existe una sesión para este usuario...');
    const existingUserSession = await connection.execute(`
      SELECT ID, USER_ID, TOKEN_HASH, EXPIRES_AT
      FROM CGBRITO.SESSIONS
      WHERE USER_ID = :userId
    `, { userId });

    if (existingUserSession.rows && existingUserSession.rows.length > 0) {
      console.log('⚠️ Ya existe una sesión para este usuario:');
      existingUserSession.rows.forEach(session => {
        console.log(`   - ID: ${session[0]}`);
        console.log(`   - User ID: ${session[1]}`);
        console.log(`   - Token Hash: ${session[2]?.substring(0, 20)}...`);
        console.log(`   - Expires At: ${session[3]}`);
      });
    } else {
      console.log('✅ No hay sesiones existentes para este usuario');
    }

    // Intentar insertar la sesión
    console.log('\n🚀 Intentando insertar la sesión...');
    try {
      const insertResult = await connection.execute(`
        INSERT INTO CGBRITO.SESSIONS (ID, USER_ID, TOKEN_HASH, EXPIRES_AT, IP_ADDRESS, USER_AGENT)
        VALUES (:sessionId, :userId, :tokenHash, :expiresAt, :ipAddress, :userAgent)
      `, {
        sessionId,
        userId,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent
      });
      
      await connection.commit();
      console.log('✅ Sesión insertada exitosamente');
      console.log(`   Filas afectadas: ${insertResult.rowsAffected}`);
      
    } catch (insertError) {
      console.error('❌ Error al insertar sesión:', insertError.message);
      console.error('   Código de error:', insertError.code);
      console.error('   Número de error Oracle:', insertError.errorNum);
      
      if (insertError.code === 'ORA-00001') {
        console.log('🔍 Este es un error de restricción única');
        console.log('   Probablemente hay un conflicto con TOKEN_HASH o ID');
      }
      
      // Rollback en caso de error
      await connection.rollback();
      console.log('🔄 Rollback realizado');
    }

    // Verificar el estado final de la tabla
    console.log('\n📊 Estado final de la tabla SESSIONS:');
    const finalCount = await connection.execute(`
      SELECT COUNT(*) as count
      FROM CGBRITO.SESSIONS
    `);
    
    if (finalCount.rows && finalCount.rows.length > 0) {
      console.log(`   Total de sesiones: ${finalCount.rows[0][0]}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\n🔌 Conexión cerrada');
      } catch (error) {
        console.error('Error cerrando conexión:', error);
      }
    }
  }
}

debugSessionsError();
