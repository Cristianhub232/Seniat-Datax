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

async function testSqlQuery() {
  try {
    console.log('🔍 Probando consulta SQL directamente...\n');
    await authSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');

    // Consulta exacta que usa la API
    const sql = `
      SELECT u.ID as id, u.USERNAME as username, u.EMAIL as email, u.ROLE_ID as role_id, u.STATUS as status, u.CREATED_AT as created_at, u.UPDATED_AT as updated_at,
             r.ID as role_id, r.NAME as role_name
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      ORDER BY u.CREATED_AT DESC
    `;

    console.log('🔍 Ejecutando consulta SQL:');
    console.log(sql);
    console.log('');

    const [users] = await authSequelize.query(sql, {
      type: 'SELECT'
    });

    console.log(`📊 Resultados obtenidos: ${users.length}`);
    console.log('🔍 Datos raw:');
    console.log(JSON.stringify(users, null, 2));
    console.log('');

    // Probar transformación
    console.log('🔄 Probando transformación...');
    const transformedUsers = Array.isArray(users) ? users.map((user) => ({
      id: user.ID || user.id,
      username: user.USERNAME || user.username,
      email: user.EMAIL || user.email,
      role_id: user.ROLE_ID || user.role_id,
      status: (user.STATUS || user.status) === 'active' || (user.STATUS || user.status) === true,
      created_at: user.CREATED_AT || user.created_at,
      updated_at: user.UPDATED_AT || user.updated_at,
      role: {
        id: user.ROLE_ID || user.role_id,
        name: user.ROLE_NAME || user.role_name || 'Sin rol'
      }
    })) : [];

    console.log('📊 Usuarios transformados:');
    console.log(JSON.stringify(transformedUsers, null, 2));
    console.log('');

    // Verificar estructura de columnas
    console.log('🔍 Verificando estructura de columnas...');
    if (users.length > 0) {
      const firstUser = users[0];
      console.log('📋 Columnas disponibles:');
      Object.keys(firstUser).forEach(key => {
        console.log(`   - ${key}: ${typeof firstUser[key]} = ${firstUser[key]}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en la consulta:', error);
  } finally {
    await authSequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la prueba
testSqlQuery(); 