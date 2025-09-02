const { Sequelize } = require('sequelize');
const crypto = require('crypto');

// Configuración Oracle
const oracleConfig = {
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
};

// Conexión para autenticación
const authSequelize = new Sequelize({
  dialect: 'oracle',
  host: oracleConfig.host,
  port: oracleConfig.port,
  database: oracleConfig.database,
  username: oracleConfig.username,
  password: oracleConfig.password,
  logging: console.log, // Habilitar logging para debug
  dialectOptions: {
    connectString: `${oracleConfig.host}:${oracleConfig.port}/${oracleConfig.database}`,
    schema: oracleConfig.schema
  },
  define: {
    schema: oracleConfig.schema
  },
  quoteIdentifiers: false
});

async function testLogin() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');

    const username = 'admin';
    const password = 'admin123';

    console.log(`🔍 Buscando usuario: ${username}`);

    // Buscar usuario con su rol
    const [users] = await authSequelize.query(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.PASSWORD_HASH, u.FIRST_NAME, u.LAST_NAME, 
             u.ROLE_ID, u.STATUS, u.LOGIN_ATTEMPTS, u.LOCKED_UNTIL, u.LAST_LOGIN,
             r.NAME as ROLE_NAME, r.DESCRIPTION as ROLE_DESCRIPTION
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = :username AND u.STATUS = 'active'
    `, {
      replacements: { username },
      type: 'SELECT'
    });

    console.log('📋 Resultado de la consulta:', JSON.stringify(users, null, 2));

    if (!users || users.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = Array.isArray(users) ? users[0] : users;
    console.log('✅ Usuario encontrado:', {
      id: user.ID,
      username: user.USERNAME,
      email: user.EMAIL,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      role: user.ROLE_NAME,
      status: user.STATUS
    });

    // Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    let passwordHash = user.PASSWORD_HASH;
    
    // Si es un CLOB de Oracle, convertirlo a string
    if (passwordHash && typeof passwordHash === 'object' && passwordHash.getData) {
      console.log('📝 Convirtiendo CLOB a string...');
      passwordHash = await passwordHash.getData();
    }
    
    console.log('🔑 Hash de contraseña:', passwordHash);
    console.log('🔑 Contraseña ingresada:', password);

    // Función simple para comparar contraseñas (bcrypt)
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    
    console.log('✅ Contraseña válida:', isPasswordValid);

    if (isPasswordValid) {
      console.log('🎉 Login exitoso!');
      
      // Obtener permisos
      const [permissions] = await authSequelize.query(`
        SELECT p.NAME
        FROM CGBRITO.PERMISSIONS p
        JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
        WHERE rp.ROLE_ID = :roleId
      `, {
        replacements: { roleId: user.ROLE_ID },
        type: 'SELECT'
      });

      console.log('🔑 Permisos del usuario:', Array.isArray(permissions) ? permissions.map(p => p.NAME) : [permissions.NAME]);
    } else {
      console.log('❌ Contraseña inválida');
    }

  } catch (error) {
    console.error('❌ Error en testLogin:', error);
  } finally {
    await authSequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

testLogin(); 