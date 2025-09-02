const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const config = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

const sequelize = new Sequelize(config);

async function testNotificationsQuery() {
  try {
    console.log('🧪 Probando consulta de notificaciones...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Probar la consulta exacta de la API
    console.log('2. Probando consulta de la API...');
    
    const page = 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const notificationsQuery = `
      SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.priority,
        n.created_by,
        n.is_active,
        n.expires_at,
        n.created_at,
        n.updated_at,
        u.username as creator_username,
        u.first_name as creator_nombre,
        u.last_name as creator_apellido
      FROM app.notifications n
      LEFT JOIN app.users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    console.log('Query:', notificationsQuery);
    console.log('Params:', [limit, offset]);

    const [notificationsResult] = await sequelize.query(notificationsQuery, {
      bind: [limit, offset],
      type: 'SELECT'
    });

    console.log('Resultado raw:', notificationsResult);
    console.log('Tipo:', typeof notificationsResult);
    console.log('Es array:', Array.isArray(notificationsResult));
    console.log('Longitud:', Array.isArray(notificationsResult) ? notificationsResult.length : 'N/A');

    // 3. Probar sin LIMIT y OFFSET
    console.log('\n3. Probando sin LIMIT y OFFSET...');
    
    const simpleQuery = `
      SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.priority,
        n.created_by,
        n.is_active,
        n.expires_at,
        n.created_at,
        n.updated_at,
        u.username as creator_username,
        u.first_name as creator_nombre,
        u.last_name as creator_apellido
      FROM app.notifications n
      LEFT JOIN app.users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
    `;

    const [simpleResult] = await sequelize.query(simpleQuery, {
      type: 'SELECT'
    });

    console.log('Resultado simple:', simpleResult);
    console.log('Longitud simple:', Array.isArray(simpleResult) ? simpleResult.length : 'N/A');

    // 4. Probar solo la tabla de notificaciones
    console.log('\n4. Probando solo tabla de notificaciones...');
    
    const basicQuery = `
      SELECT * FROM app.notifications ORDER BY created_at DESC
    `;

    const [basicResult] = await sequelize.query(basicQuery, {
      type: 'SELECT'
    });

    console.log('Resultado básico:', basicResult);
    console.log('Longitud básica:', Array.isArray(basicResult) ? basicResult.length : 'N/A');

    console.log('\n✅ Prueba completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar prueba
testNotificationsQuery(); 