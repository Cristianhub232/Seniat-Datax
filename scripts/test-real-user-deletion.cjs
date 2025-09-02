const { Sequelize } = require('sequelize');

// Configuración Oracle para SENIAT
const oracleConfig = {
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
};

// Conexión específica para autenticación (esquema CGBRITO)
const authSequelize = new Sequelize({
  dialect: 'oracle',
  host: oracleConfig.host,
  port: oracleConfig.port,
  database: oracleConfig.database,
  username: oracleConfig.username,
  password: oracleConfig.password,
  logging: false,
  dialectOptions: {
    connectString: `${oracleConfig.host}:${oracleConfig.port}/${oracleConfig.database}`,
    schema: oracleConfig.schema
  },
  define: {
    schema: oracleConfig.schema
  },
  quoteIdentifiers: false
});

async function testRealUserDeletion() {
  try {
    console.log('🔍 Probando eliminación real de usuario...');
    
    // Verificar conexión
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // 1. Buscar un usuario existente para eliminar (excluyendo admin)
    console.log('🔍 1. Buscando usuario para eliminar...');
    const existingUsers = await authSequelize.query(
      "SELECT ID, USERNAME, EMAIL FROM CGBRITO.USERS WHERE USERNAME != 'admin' AND ROWNUM <= 1",
      {
        type: 'SELECT'
      }
    );
    
    console.log('📊 Resultado de búsqueda:', existingUsers);
    
    if (!existingUsers || existingUsers.length === 0) {
      console.log('❌ No se encontraron usuarios para eliminar');
      return;
    }
    
    const userToDelete = existingUsers[0];
    console.log(`✅ Usuario encontrado: ${userToDelete.USERNAME} (ID: ${userToDelete.ID})`);
    
    // 2. Verificar que el usuario existe antes de eliminar
    console.log('🔍 2. Verificando que el usuario existe...');
    const verifyBefore = await authSequelize.query(
      'SELECT ID FROM CGBRITO.USERS WHERE ID = ?',
      {
        replacements: [userToDelete.ID],
        type: 'SELECT'
      }
    );
    
    if (!verifyBefore || verifyBefore.length === 0) {
      console.log('❌ Usuario no encontrado antes de eliminar');
      return;
    }
    
    console.log('✅ Usuario existe antes de eliminar');
    
    // 3. Eliminar el usuario
    console.log('🗑️ 3. Eliminando usuario...');
    try {
      const deleteResult = await authSequelize.query(
        'DELETE FROM CGBRITO.USERS WHERE ID = ?',
        {
          replacements: [userToDelete.ID],
          type: 'DELETE'
        }
      );
      
      console.log('✅ Usuario eliminado exitosamente');
      console.log('📊 Resultado de eliminación:', deleteResult);
      
      // 4. Verificar que el usuario fue eliminado
      console.log('🔍 4. Verificando eliminación...');
      const verifyAfter = await authSequelize.query(
        'SELECT ID FROM CGBRITO.USERS WHERE ID = ?',
        {
          replacements: [userToDelete.ID],
          type: 'SELECT'
        }
      );
      
      if (!verifyAfter || verifyAfter.length === 0) {
        console.log('✅ Usuario eliminado correctamente de la base de datos');
      } else {
        console.log('❌ Usuario aún existe después de la eliminación');
      }
      
    } catch (deleteError) {
      console.log('❌ Error eliminando usuario:', deleteError.message);
    }
    
    // 5. Verificar total de usuarios
    console.log('📊 5. Verificando total de usuarios...');
    const totalUsers = await authSequelize.query(
      'SELECT COUNT(*) as count FROM CGBRITO.USERS'
    );
    
    console.log(`👥 Total de usuarios en la tabla: ${totalUsers[0].COUNT}`);
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await authSequelize.close();
    console.log('🔒 Conexión cerrada');
  }
}

testRealUserDeletion(); 