const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

// Configuración de la base de datos Oracle
const authSequelize = new Sequelize({
  dialect: 'oracle',
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  logging: false,
  dialectOptions: {
    connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`,
    schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
  },
  define: {
    schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
  },
  quoteIdentifiers: false
});

// Función para generar hash de contraseña (simulada)
function hashPassword(password) {
  // En producción usar bcrypt, aquí simulamos
  return `hashed_${password}_${Date.now()}`;
}

// Función para generar UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Usuarios de prueba
const testUsers = [
  {
    username: 'admin',
    email: 'admin@seniat.gob.ve',
    password: 'admin123',
    role_name: 'ADMIN',
    status: 'active'
  },
  {
    username: 'analista1',
    email: 'analista1@seniat.gob.ve',
    password: 'analista123',
    role_name: 'ANALISTA',
    status: 'active'
  },
  {
    username: 'analista2',
    email: 'analista2@seniat.gob.ve',
    password: 'analista123',
    role_name: 'ANALISTA',
    status: 'active'
  },
  {
    username: 'supervisor1',
    email: 'supervisor1@seniat.gob.ve',
    password: 'supervisor123',
    role_name: 'SUPERVISOR',
    status: 'active'
  },
  {
    username: 'usuario1',
    email: 'usuario1@seniat.gob.ve',
    password: 'usuario123',
    role_name: 'USER',
    status: 'active'
  },
  {
    username: 'usuario2',
    email: 'usuario2@seniat.gob.ve',
    password: 'usuario123',
    role_name: 'USER',
    status: 'inactive'
  },
  {
    username: 'auditor1',
    email: 'auditor1@seniat.gob.ve',
    password: 'auditor123',
    role_name: 'AUDITOR',
    status: 'active'
  },
  {
    username: 'gerente1',
    email: 'gerente1@seniat.gob.ve',
    password: 'gerente123',
    role_name: 'GERENTE',
    status: 'active'
  }
];

async function loadTestUsers() {
  try {
    console.log('🔍 Conectando a la base de datos Oracle...');
    await authSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar si las tablas existen
    console.log('🔍 Verificando estructura de tablas...');
    
    const [tables] = await authSequelize.query(`
      SELECT TABLE_NAME 
      FROM USER_TABLES 
      WHERE TABLE_NAME IN ('USERS', 'ROLES')
    `);
    
    console.log('📋 Tablas encontradas:', tables.map(t => t.TABLE_NAME));

    // Verificar roles existentes
    console.log('🔍 Verificando roles existentes...');
    const [existingRoles] = await authSequelize.query(`
      SELECT ID, NAME FROM CGBRITO.ROLES
    `);
    
    console.log('👥 Roles existentes:', existingRoles);

    // Crear roles si no existen
    const requiredRoles = ['ADMIN', 'ANALISTA', 'SUPERVISOR', 'USER', 'AUDITOR', 'GERENTE'];
    const roleMap = {};

    for (const roleName of requiredRoles) {
      const existingRole = existingRoles.find(r => r.NAME === roleName);
      if (existingRole) {
        roleMap[roleName] = existingRole.ID;
        console.log(`✅ Rol ${roleName} ya existe (ID: ${existingRole.ID})`);
      } else {
        console.log(`➕ Creando rol ${roleName}...`);
        // Obtener el siguiente ID disponible
        const [maxIdResult] = await authSequelize.query(`
          SELECT MAX(ID) as max_id FROM CGBRITO.ROLES
        `);
        const nextId = (maxIdResult[0].MAX_ID || 0) + 1;
        
        await authSequelize.query(`
          INSERT INTO CGBRITO.ROLES (ID, NAME, CREATED_AT, UPDATED_AT) 
          VALUES (?, ?, SYSDATE, SYSDATE)
        `, {
          replacements: [nextId, roleName],
          type: 'INSERT'
        });
        roleMap[roleName] = nextId;
        console.log(`✅ Rol ${roleName} creado (ID: ${nextId})`);
      }
    }

    // Verificar usuarios existentes
    console.log('🔍 Verificando usuarios existentes...');
    const [existingUsers] = await authSequelize.query(`
      SELECT USERNAME FROM CGBRITO.USERS
    `);
    
    const existingUsernames = existingUsers.map(u => u.USERNAME);
    console.log('👤 Usuarios existentes:', existingUsernames);

    // Crear usuarios de prueba
    console.log('🚀 Creando usuarios de prueba...');
    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of testUsers) {
      if (existingUsernames.includes(userData.username)) {
        console.log(`⏭️  Usuario ${userData.username} ya existe, saltando...`);
        skippedCount++;
        continue;
      }

      try {
        const userId = generateUUID();
        const passwordHash = hashPassword(userData.password);
        const roleId = roleMap[userData.role_name];

        if (!roleId) {
          console.error(`❌ Rol ${userData.role_name} no encontrado para usuario ${userData.username}`);
          continue;
        }

        await authSequelize.query(`
          INSERT INTO CGBRITO.USERS (
            ID, USERNAME, EMAIL, PASSWORD_HASH, ROLE_ID, STATUS, CREATED_AT, UPDATED_AT
          ) VALUES (?, ?, ?, ?, ?, ?, SYSDATE, SYSDATE)
        `, {
          replacements: [
            userId,
            userData.username,
            userData.email,
            passwordHash,
            roleId,
            userData.status
          ],
          type: 'INSERT'
        });

        console.log(`✅ Usuario ${userData.username} creado exitosamente`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creando usuario ${userData.username}:`, error.message);
      }
    }

    // Verificar usuarios finales
    console.log('🔍 Verificando usuarios finales...');
    const [finalUsers] = await authSequelize.query(`
      SELECT u.USERNAME, u.EMAIL, u.STATUS, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      ORDER BY u.CREATED_AT DESC
    `);

    console.log('\n📊 RESUMEN:');
    console.log(`✅ Usuarios creados: ${createdCount}`);
    console.log(`⏭️  Usuarios saltados: ${skippedCount}`);
    console.log(`📋 Total de usuarios en BD: ${finalUsers.length}`);

    console.log('\n👥 USUARIOS EN LA BASE DE DATOS:');
    finalUsers.forEach(user => {
      console.log(`  - ${user.USERNAME} (${user.EMAIL}) - ${user.ROLE_NAME} - ${user.STATUS}`);
    });

    // Verificar métricas
    console.log('\n📈 MÉTRICAS:');
    const [metrics] = await authSequelize.query(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN STATUS = 'active' THEN 1 ELSE 0 END) as usuarios_activos,
        SUM(CASE WHEN STATUS = 'inactive' THEN 1 ELSE 0 END) as usuarios_inactivos,
        COUNT(DISTINCT ROLE_ID) as roles_utilizados
      FROM CGBRITO.USERS
    `);

    const metric = metrics[0];
    console.log(`  📊 Total usuarios: ${metric.TOTAL_USUARIOS}`);
    console.log(`  ✅ Usuarios activos: ${metric.USUARIOS_ACTIVOS}`);
    console.log(`  ⚠️  Usuarios inactivos: ${metric.USUARIOS_INACTIVOS}`);
    console.log(`  🎭 Roles utilizados: ${metric.ROLES_UTILIZADOS}`);

    console.log('\n🎉 Script completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await authSequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
loadTestUsers(); 