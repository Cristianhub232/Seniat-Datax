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

async function createUserRlara() {
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
    
    // Verificar si ya existe usuario rlara
    console.log('🔍 Verificando usuario rlara existente...');
    const rlaraExists = await connection.execute(
      'SELECT USERNAME, STATUS FROM CGBRITO.USERS WHERE USERNAME = :username',
      ['rlara']
    );
    
    if (rlaraExists.rows.length > 0) {
      console.log('✅ Usuario rlara ya existe');
      
      const userStatus = rlaraExists.rows[0][1];
      console.log('Estado del usuario rlara:', userStatus);
      
      if (userStatus !== 'active') {
        console.log('🔄 Activando usuario rlara...');
        await connection.execute(
          'UPDATE CGBRITO.USERS SET STATUS = :status WHERE USERNAME = :username',
          ['active', 'rlara']
        );
        await connection.commit();
        console.log('✅ Usuario rlara activado');
      }
      
      // Verificar credenciales
      const rlaraUser = await connection.execute(`
        SELECT u.USERNAME, u.EMAIL, u.PASSWORD_HASH, u.STATUS, r.NAME as ROLE_NAME
        FROM CGBRITO.USERS u
        JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
        WHERE u.USERNAME = :username
      `, ['rlara']);
      
      if (rlaraUser.rows.length > 0) {
        const user = rlaraUser.rows[0];
        try {
          // Convertir CLOB a string
          const passwordHash = await user[2].getData();
          const isValidPassword = await bcrypt.compare('rlara123', passwordHash);
          
          console.log('\n📝 Credenciales del usuario rlara:');
          console.log('   Usuario: rlara');
          console.log('   Email:', user[1]);
          console.log('   Contraseña: rlara123');
          console.log('   Rol:', user[4]);
          console.log('   Estado:', user[3]);
          console.log('   Contraseña válida:', isValidPassword ? 'Sí' : 'No');
          
          if (!isValidPassword) {
            console.log('🔄 Actualizando contraseña...');
            const newHashedPassword = await bcrypt.hash('rlara123', 10);
            await connection.execute(
              'UPDATE CGBRITO.USERS SET PASSWORD_HASH = :passwordHash WHERE USERNAME = :username',
              [newHashedPassword, 'rlara']
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
    
    console.log('📝 Creando usuario rlara...');
    
    // Obtener rol admin
    const adminRole = await connection.execute(
      'SELECT ID FROM CGBRITO.ROLES WHERE NAME = :name',
      ['ADMIN']
    );
    
    if (adminRole.rows.length === 0) {
      console.log('❌ Rol ADMIN no encontrado, buscando otros roles...');
      const roles = await connection.execute('SELECT ID, NAME FROM CGBRITO.ROLES');
      console.log('Roles disponibles:');
      roles.rows.forEach(role => {
        console.log(`- ${role[1]} (ID: ${role[0]})`);
      });
      
      if (roles.rows.length === 0) {
        console.log('❌ No hay roles disponibles');
        return;
      }
      
      // Usar el primer rol disponible
      const roleId = roles.rows[0][0];
      console.log(`Usando rol: ${roles.rows[0][1]}`);
    }
    
    // Generar UUID para el usuario
    const userId = uuidv4();
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('rlara123', 10);
    
    // Crear usuario rlara
    await connection.execute(`
      INSERT INTO CGBRITO.USERS (
        ID, USERNAME, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, ROLE_ID, STATUS
      ) VALUES (
        :id, :username, :email, :passwordHash, :firstName, :lastName, :roleId, :status
      )
    `, {
      id: userId,
      username: 'rlara',
      email: 'rlara@seniat.gob.ve',
      passwordHash: hashedPassword,
      firstName: 'Roberto',
      lastName: 'Lara',
      roleId: adminRole.rows[0][0],
      status: 'active'
    });
    
    // Hacer commit
    await connection.commit();
    
    console.log('✅ Usuario rlara creado exitosamente');
    console.log('\n📝 Credenciales del usuario rlara:');
    console.log('   Usuario: rlara');
    console.log('   Email: rlara@seniat.gob.ve');
    console.log('   Contraseña: rlara123');
    console.log('   Rol: ADMIN');
    console.log('   Estado: active');
    
    // Verificar credenciales
    const rlaraUser = await connection.execute(`
      SELECT u.USERNAME, u.EMAIL, u.PASSWORD_HASH, u.STATUS, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = :username
    `, ['rlara']);
    
    if (rlaraUser.rows.length > 0) {
      const user = rlaraUser.rows[0];
      try {
        // Convertir CLOB a string
        const passwordHash = await user[2].getData();
        const isValidPassword = await bcrypt.compare('rlara123', passwordHash);
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

createUserRlara(); 