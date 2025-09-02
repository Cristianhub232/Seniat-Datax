const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function createEjecutivoUser() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar usuarios existentes
    console.log('🔍 Verificando usuarios existentes...');
    const existingUsers = await connection.execute(
      'SELECT USERNAME, EMAIL FROM CGBRITO.USERS'
    );
    
    console.log('Usuarios existentes:');
    existingUsers.rows.forEach(user => {
      console.log(`- ${user[0]} (${user[1]})`);
    });
    
    // Verificar si ya existe usuario ejecutivo
    console.log('🔍 Verificando usuario ejecutivo existente...');
    const ejecutivoExists = await connection.execute(
      'SELECT USERNAME, STATUS FROM CGBRITO.USERS WHERE USERNAME = :username',
      ['ejecutivo']
    );
    
    if (ejecutivoExists.rows.length > 0) {
      console.log('✅ Usuario ejecutivo ya existe');
      
      const userStatus = ejecutivoExists.rows[0][1];
      console.log('Estado del usuario ejecutivo:', userStatus);
      
      if (userStatus !== 'active') {
        console.log('🔄 Activando usuario ejecutivo...');
        await connection.execute(
          'UPDATE CGBRITO.USERS SET STATUS = :status WHERE USERNAME = :username',
          ['active', 'ejecutivo']
        );
        await connection.commit();
        console.log('✅ Usuario ejecutivo activado');
      }
      
      // Verificar credenciales
      const ejecutivoUser = await connection.execute(`
        SELECT u.USERNAME, u.EMAIL, u.PASSWORD_HASH, u.STATUS, r.NAME as ROLE_NAME
        FROM CGBRITO.USERS u
        JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
        WHERE u.USERNAME = :username
      `, ['ejecutivo']);
      
      if (ejecutivoUser.rows.length > 0) {
        const user = ejecutivoUser.rows[0];
        try {
          // Convertir CLOB a string
          const passwordHash = await user[2].getData();
          const isValidPassword = await bcrypt.compare('ejecutivo123', passwordHash);
          
          console.log('\n📝 Credenciales del usuario ejecutivo:');
          console.log('   Usuario: ejecutivo');
          console.log('   Email:', user[1]);
          console.log('   Contraseña: ejecutivo123');
          console.log('   Rol:', user[4]);
          console.log('   Estado:', user[3]);
          console.log('   Contraseña válida:', isValidPassword ? 'Sí' : 'No');
          
          if (!isValidPassword) {
            console.log('🔄 Actualizando contraseña...');
            const newHashedPassword = await bcrypt.hash('ejecutivo123', 10);
            await connection.execute(
              'UPDATE CGBRITO.USERS SET PASSWORD_HASH = :passwordHash WHERE USERNAME = :username',
              [newHashedPassword, 'ejecutivo']
            );
            await connection.commit();
            console.log('✅ Contraseña actualizada');
          }
        } catch (error) {
          console.log('   Contraseña válida: Error verificando -', error.message);
        }
      }
      
      return;
    }
    
    console.log('📝 Creando usuario ejecutivo...');
    
    // Obtener rol ejecutivo o crear uno si no existe
    let ejecutivoRole = await connection.execute(
      'SELECT ID FROM CGBRITO.ROLES WHERE NAME = :name',
      ['Ejecutivo']
    );
    
    if (ejecutivoRole.rows.length === 0) {
      console.log('🔍 Rol Ejecutivo no encontrado, creando...');
      
      // Crear rol ejecutivo
      const roleId = uuidv4();
      await connection.execute(`
        INSERT INTO CGBRITO.ROLES (ID, NAME, DESCRIPTION, STATUS)
        VALUES (:id, :name, :description, :status)
      `, {
        id: roleId,
        name: 'Ejecutivo',
        description: 'Rol para ejecutivos que pueden acceder a cartera de contribuyentes',
        status: 'active'
      });
      
      console.log('✅ Rol Ejecutivo creado');
      ejecutivoRole = { rows: [[roleId]] };
    }
    
    // Generar UUID para el usuario
    const userId = uuidv4();
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('ejecutivo123', 10);
    
    // Crear usuario ejecutivo
    await connection.execute(`
      INSERT INTO CGBRITO.USERS (
        ID, USERNAME, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, ROLE_ID, STATUS
      ) VALUES (
        :id, :username, :email, :passwordHash, :firstName, :lastName, :roleId, :status
      )
    `, {
      id: userId,
      username: 'ejecutivo',
      email: 'ejecutivo@seniat.gob.ve',
      passwordHash: hashedPassword,
      firstName: 'Ejecutivo',
      lastName: 'Sistema',
      roleId: ejecutivoRole.rows[0][0],
      status: 'active'
    });
    
    // Hacer commit
    await connection.commit();
    
    console.log('✅ Usuario ejecutivo creado exitosamente');
    console.log('\n📝 Credenciales del usuario ejecutivo:');
    console.log('   Usuario: ejecutivo');
    console.log('   Email: ejecutivo@seniat.gob.ve');
    console.log('   Contraseña: ejecutivo123');
    console.log('   Rol: Ejecutivo');
    console.log('   Estado: active');
    
    // Verificar credenciales
    const ejecutivoUser = await connection.execute(`
      SELECT u.USERNAME, u.EMAIL, u.PASSWORD_HASH, u.STATUS, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = :username
    `, ['ejecutivo']);
    
    if (ejecutivoUser.rows.length > 0) {
      const user = ejecutivoUser.rows[0];
      try {
        // Convertir CLOB a string
        const passwordHash = await user[2].getData();
        const isValidPassword = await bcrypt.compare('ejecutivo123', passwordHash);
        console.log('   Contraseña válida:', isValidPassword ? 'Sí' : 'No');
      } catch (error) {
        console.log('   Contraseña válida: Error verificando -', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) {
      await connection.rollback();
    }
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

createEjecutivoUser(); 