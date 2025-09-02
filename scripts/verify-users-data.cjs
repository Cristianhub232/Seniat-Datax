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

async function verifyUsersData() {
  try {
    console.log('🔍 Verificando datos de usuarios en la base de datos...\n');
    await authSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');

    // 1. Verificar estructura de tablas
    console.log('📋 1. Verificando estructura de tablas...');
    const [tables] = await authSequelize.query(`
      SELECT TABLE_NAME, NUM_ROWS 
      FROM USER_TABLES 
      WHERE TABLE_NAME IN ('USERS', 'ROLES')
      ORDER BY TABLE_NAME
    `);
    
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}: ${table.NUM_ROWS || 0} filas`);
    });
    console.log('');

    // 2. Verificar usuarios
    console.log('👥 2. Verificando usuarios...');
    const [users] = await authSequelize.query(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.STATUS, u.CREATED_AT, u.UPDATED_AT,
             r.ID as ROLE_ID, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      ORDER BY u.CREATED_AT DESC
    `);

    console.log(`📊 Total usuarios encontrados: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.USERNAME} (${user.EMAIL})`);
      console.log(`      - ID: ${user.ID}`);
      console.log(`      - Status: ${user.STATUS}`);
      console.log(`      - Role: ${user.ROLE_NAME} (ID: ${user.ROLE_ID})`);
      console.log(`      - Created: ${user.CREATED_AT}`);
      console.log('');
    });

    // 3. Verificar roles
    console.log('🎭 3. Verificando roles...');
    const [roles] = await authSequelize.query(`
      SELECT r.ID, r.NAME, r.DESCRIPTION, r.CREATED_AT, r.UPDATED_AT,
             COUNT(u.ID) as USER_COUNT
      FROM CGBRITO.ROLES r
      LEFT JOIN CGBRITO.USERS u ON r.ID = u.ROLE_ID
      GROUP BY r.ID, r.NAME, r.DESCRIPTION, r.CREATED_AT, r.UPDATED_AT
      ORDER BY r.ID
    `);

    console.log(`📊 Total roles encontrados: ${roles.length}`);
    roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.NAME} (ID: ${role.ID})`);
      console.log(`      - Description: ${role.DESCRIPTION || 'Sin descripción'}`);
      console.log(`      - Users: ${role.USER_COUNT}`);
      console.log(`      - Created: ${role.CREATED_AT}`);
      console.log('');
    });

    // 4. Verificar métricas
    console.log('📈 4. Verificando métricas...');
    const [metrics] = await authSequelize.query(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN STATUS = 'active' THEN 1 ELSE 0 END) as usuarios_activos,
        SUM(CASE WHEN STATUS = 'inactive' THEN 1 ELSE 0 END) as usuarios_inactivos,
        COUNT(DISTINCT ROLE_ID) as roles_utilizados,
        COUNT(DISTINCT USERNAME) as usernames_unicos,
        COUNT(DISTINCT EMAIL) as emails_unicos
      FROM CGBRITO.USERS
    `);

    const metric = metrics[0];
    console.log('📊 Métricas de usuarios:');
    console.log(`   - Total usuarios: ${metric.TOTAL_USUARIOS}`);
    console.log(`   - Usuarios activos: ${metric.USUARIOS_ACTIVOS}`);
    console.log(`   - Usuarios inactivos: ${metric.USUARIOS_INACTIVOS}`);
    console.log(`   - Roles utilizados: ${metric.ROLES_UTILIZADOS}`);
    console.log(`   - Usernames únicos: ${metric.USERNAMES_UNICOS}`);
    console.log(`   - Emails únicos: ${metric.EMAILS_UNICOS}`);
    console.log('');

    // 5. Verificar usuario admin específicamente
    console.log('👑 5. Verificando usuario admin...');
    const [adminUser] = await authSequelize.query(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.STATUS, u.ROLE_ID,
             r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = 'admin'
    `);

    if (adminUser.length > 0) {
      const admin = adminUser[0];
      console.log('✅ Usuario admin encontrado:');
      console.log(`   - ID: ${admin.ID}`);
      console.log(`   - Username: ${admin.USERNAME}`);
      console.log(`   - Email: ${admin.EMAIL}`);
      console.log(`   - Status: ${admin.STATUS}`);
      console.log(`   - Role: ${admin.ROLE_NAME} (ID: ${admin.ROLE_ID})`);
    } else {
      console.log('❌ Usuario admin no encontrado');
    }
    console.log('');

    // 6. Verificar consulta que usa la API
    console.log('🔍 6. Verificando consulta de la API...');
    const [apiQuery] = await authSequelize.query(`
      SELECT u.ID as id, u.USERNAME as username, u.EMAIL as email, u.ROLE_ID as role_id, u.STATUS as status, u.CREATED_AT as created_at, u.UPDATED_AT as updated_at,
             r.ID as role_id, r.NAME as role_name
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      ORDER BY u.CREATED_AT DESC
    `);

    console.log(`📊 Consulta API devuelve: ${apiQuery.length} usuarios`);
    if (apiQuery.length > 0) {
      console.log('✅ Ejemplo de datos:');
      const sample = apiQuery[0];
      console.log(`   - ID: ${sample.ID}`);
      console.log(`   - Username: ${sample.USERNAME}`);
      console.log(`   - Email: ${sample.EMAIL}`);
      console.log(`   - Status: ${sample.STATUS}`);
      console.log(`   - Role: ${sample.ROLE_NAME}`);
    }
    console.log('');

    console.log('🎉 Verificación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  } finally {
    await authSequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la verificación
verifyUsersData(); 