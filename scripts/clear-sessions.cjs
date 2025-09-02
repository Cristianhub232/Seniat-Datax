const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function clearSessions() {
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

    // Verificar sesiones existentes
    console.log('\n📊 Sesiones existentes antes de limpiar:');
    const countBefore = await connection.execute(`
      SELECT COUNT(*) as count
      FROM CGBRITO.SESSIONS
    `);
    
    if (countBefore.rows && countBefore.rows.length > 0) {
      console.log(`   Total de sesiones: ${countBefore.rows[0][0]}`);
    }

    // Mostrar algunas sesiones existentes
    const sessionsBefore = await connection.execute(`
      SELECT ID, USER_ID, TOKEN_HASH, EXPIRES_AT, CREATED_AT
      FROM CGBRITO.SESSIONS
      WHERE ROWNUM <= 5
      ORDER BY CREATED_AT DESC
    `);
    
    if (sessionsBefore.rows && sessionsBefore.rows.length > 0) {
      console.log('\n🔍 Últimas sesiones:');
      sessionsBefore.rows.forEach(session => {
        console.log(`   - ID: ${session[0]}`);
        console.log(`     User ID: ${session[1]}`);
        console.log(`     Token Hash: ${session[2]?.substring(0, 20)}...`);
        console.log(`     Expira: ${session[3]}`);
        console.log(`     Creada: ${session[4]}`);
        console.log('');
      });
    }

    // Limpiar todas las sesiones
    console.log('🧹 Limpiando todas las sesiones...');
    const deleteResult = await connection.execute(`
      DELETE FROM CGBRITO.SESSIONS
    `);
    
    await connection.commit();
    console.log(`✅ Sesiones eliminadas: ${deleteResult.rowsAffected}`);

    // Verificar que se hayan eliminado
    console.log('\n📊 Verificando que se hayan eliminado:');
    const countAfter = await connection.execute(`
      SELECT COUNT(*) as count
      FROM CGBRITO.SESSIONS
    `);
    
    if (countAfter.rows && countAfter.rows.length > 0) {
      console.log(`   Total de sesiones después: ${countAfter.rows[0][0]}`);
    }

    if (countAfter.rows[0][0] === 0) {
      console.log('✅ Todas las sesiones han sido eliminadas correctamente');
    } else {
      console.log('⚠️ Aún quedan algunas sesiones');
    }

    console.log('\n🎯 Ahora puedes probar el login nuevamente');
    console.log('   El problema de restricción única debería estar resuelto');

  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) {
      try {
        await connection.rollback();
        console.log('🔄 Rollback realizado');
      } catch (rollbackError) {
        console.error('Error en rollback:', rollbackError);
      }
    }
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

clearSessions();
