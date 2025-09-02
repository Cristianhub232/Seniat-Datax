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

async function createAdminUser() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar si ya existe usuario admin
    console.log('🔍 Verificando usuario admin existente...');
    const adminExists = await connection.execute(
      'SELECT USERNAME FROM CGBRITO.USERS WHERE USERNAME = :username',
      ['admin']
    );
    
    if (adminExists.rows.length > 0) {
      console.log('✅ Usuario admin ya existe');
      
      // Verificar credenciales
      const adminUser = await connection.execute(`
        SELECT u.USERNAME, u.EMAIL, u.PASSWORD_HASH, r.NAME as ROLE_NAME
        FROM CGBRITO.USERS u
        JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
        WHERE u.USERNAME = :username
      `, ['admin']);
      
      if (adminUser.rows.length > 0) {
        const user = adminUser.rows[0];
        try {
          // Convertir CLOB a string
          const passwordHash = await user[2].getData();
          const isValidPassword = await bcrypt.compare('admin123', passwordHash);
          console.log('   Contraseña válida:', isValidPassword ? 'Sí' : 'No');
        } catch (error) {
          console.log('   Contraseña válida: Error verificando -', error.message);
        }
      }
      
      return;
    }
    
    console.log('📝 Creando usuario admin...');
    
    // Obtener rol admin
    const adminRole = await connection.execute(
      'SELECT ID FROM CGBRITO.ROLES WHERE NAME = :name',
      ['ADMIN']
    );
    
    if (adminRole.rows.length === 0) {
      console.log('❌ Rol ADMIN no encontrado');
      console.log('💡 Ejecuta primero: node scripts/create-auth-tables-oracle.cjs');
      return;
    }
    
    // Generar UUID para el usuario
    const userId = uuidv4();
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Crear usuario admin
    await connection.execute(`
      INSERT INTO CGBRITO.USERS (
        ID, USERNAME, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, ROLE_ID, STATUS
      ) VALUES (
        :id, :username, :email, :passwordHash, :firstName, :lastName, :roleId, :status
      )
    `, {
      id: userId,
      username: 'admin',
      email: 'admin@seniat.gob.ve',
      passwordHash: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      roleId: adminRole.rows[0][0],
      status: 'active'
    });
    
    // Asignar permisos al rol admin
    console.log('🔐 Asignando permisos al rol ADMIN...');
    const permissions = await connection.execute(
      'SELECT ID FROM CGBRITO.PERMISSIONS'
    );
    
    for (const permission of permissions.rows) {
      try {
        await connection.execute(`
          INSERT INTO CGBRITO.ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
          VALUES (:roleId, :permissionId)
        `, {
          roleId: adminRole.rows[0][0],
          permissionId: permission[0]
        });
      } catch (error) {
        // Ignorar errores de duplicados
        if (!error.message.includes('unique constraint')) {
          console.log('⚠️  Error asignando permiso:', error.message);
        }
      }
    }
    
    // Hacer commit
    await connection.commit();
    
    console.log('✅ Usuario admin creado exitosamente');
    console.log('\n📝 Credenciales del usuario admin:');
    console.log('   Usuario: admin');
    console.log('   Email: admin@seniat.gob.ve');
    console.log('   Contraseña: admin123');
    console.log('   Rol: ADMIN');
    
    // Verificar credenciales
    const adminUser = await connection.execute(`
      SELECT u.USERNAME, u.EMAIL, u.PASSWORD_HASH, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = :username
    `, ['admin']);
    
    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0];
      try {
        // Convertir CLOB a string
        const passwordHash = await user[2].getData();
        const isValidPassword = await bcrypt.compare('admin123', passwordHash);
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

createAdminUser(); 