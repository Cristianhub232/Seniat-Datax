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

async function testRolesSql() {
  try {
    console.log('🔍 Probando consulta SQL de roles directamente...\n');
    await authSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');

    // Consulta exacta que usa la API
    const sql = `
      SELECT r.ID as id, r.NAME as name, r.DESCRIPTION as description, r.CREATED_AT as created_at, r.UPDATED_AT as updated_at,
             COUNT(u.ID) as user_count
      FROM CGBRITO.ROLES r
      LEFT JOIN CGBRITO.USERS u ON r.ID = u.ROLE_ID
      GROUP BY r.ID, r.NAME, r.DESCRIPTION, r.CREATED_AT, r.UPDATED_AT
      ORDER BY r.CREATED_AT DESC
    `;

    console.log('🔍 Ejecutando consulta SQL:');
    console.log(sql);
    console.log('');

    const result = await authSequelize.query(sql, {
      type: 'SELECT'
    });

    console.log(`📊 Resultados obtenidos: ${result.length}`);
    console.log('🔍 Datos raw:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Probar transformación
    console.log('🔄 Probando transformación...');
    const transformedRoles = result.map((role) => ({
      id: role.ID || role.id,
      name: role.NAME || role.name,
      description: role.DESCRIPTION || role.description,
      status: 'active',
      created_at: role.CREATED_AT || role.created_at,
      updated_at: role.UPDATED_AT || role.updated_at,
      userCount: parseInt(role.USER_COUNT || role.user_count) || 0
    }));

    console.log('📊 Roles transformados:');
    console.log(JSON.stringify(transformedRoles, null, 2));
    console.log('');

    // Verificar estructura de columnas
    console.log('🔍 Verificando estructura de columnas...');
    if (result.length > 0) {
      const firstRole = result[0];
      console.log('📋 Columnas disponibles:');
      Object.keys(firstRole).forEach(key => {
        console.log(`   - ${key}: ${typeof firstRole[key]} = ${firstRole[key]}`);
      });
    }

    // Probar consulta simple sin GROUP BY
    console.log('\n🔍 Probando consulta simple sin GROUP BY...');
    const simpleSql = `
      SELECT r.ID, r.NAME, r.DESCRIPTION, r.CREATED_AT, r.UPDATED_AT
      FROM CGBRITO.ROLES r
      ORDER BY r.CREATED_AT DESC
    `;

    const simpleResult = await authSequelize.query(simpleSql, {
      type: 'SELECT'
    });

    console.log(`📊 Roles simples obtenidos: ${simpleResult.length}`);
    console.log('🔍 Datos simples:');
    console.log(JSON.stringify(simpleResult, null, 2));

  } catch (error) {
    console.error('❌ Error en la consulta:', error);
  } finally {
    await authSequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la prueba
testRolesSql(); 