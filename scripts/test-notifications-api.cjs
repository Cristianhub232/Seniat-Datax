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

async function testNotificationsAPI() {
  try {
    console.log('🧪 Probando API de Notificaciones...\n');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Verificar que la tabla existe
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'app' AND table_name = 'notifications'
    `);

    if (tables.length === 0) {
      console.log('❌ Tabla app.notifications no existe');
      return;
    }

    console.log('✅ Tabla app.notifications existe\n');

    // Verificar estructura de la tabla
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'app' AND table_name = 'notifications'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estructura de la tabla:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // Verificar datos existentes
    const [notifications] = await sequelize.query(`
      SELECT id, title, type, priority, is_active, created_at
      FROM app.notifications
      ORDER BY created_at DESC
    `);

    console.log('\n📊 Notificaciones existentes:');
    if (notifications.length > 0) {
      notifications.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.title} (${notification.type.toUpperCase()}) - ${notification.is_active ? '✅ Activa' : '❌ Inactiva'}`);
      });
    } else {
      console.log('   No hay notificaciones en la tabla');
    }

    // Probar consulta con JOIN a usuarios
    console.log('\n🔍 Probando consulta con JOIN a usuarios...');
    const [testQuery] = await sequelize.query(`
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
      LIMIT 5
    `);

    console.log('✅ Consulta con JOIN exitosa');
    console.log(`   Resultados: ${testQuery.length} notificaciones`);

    if (testQuery.length > 0) {
      const notification = testQuery[0];
      console.log('   Ejemplo de resultado:');
      console.log(`     ID: ${notification.id}`);
      console.log(`     Título: ${notification.title}`);
      console.log(`     Tipo: ${notification.type}`);
      console.log(`     Creador: ${notification.creator_nombre} ${notification.creator_apellido}`);
    }

    // Probar estadísticas
    console.log('\n📈 Probando consulta de estadísticas...');
    const [statsQuery] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN expires_at < CURRENT_TIMESTAMP THEN 1 END) as expired,
        COUNT(CASE WHEN type = 'info' THEN 1 END) as info_count,
        COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN type = 'error' THEN 1 END) as error_count,
        COUNT(CASE WHEN type = 'success' THEN 1 END) as success_count,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_count,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_count
      FROM app.notifications
    `);

    const stats = statsQuery[0];
    console.log('✅ Consulta de estadísticas exitosa');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Activas: ${stats.active}`);
    console.log(`   Expiradas: ${stats.expired}`);
    console.log(`   Por tipo - Info: ${stats.info_count}, Warning: ${stats.warning_count}, Error: ${stats.error_count}, Success: ${stats.success_count}`);
    console.log(`   Por prioridad - Low: ${stats.low_count}, Medium: ${stats.medium_count}, High: ${stats.high_count}`);

    console.log('\n🎉 ¡Todas las pruebas de la API de notificaciones pasaron exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar pruebas
testNotificationsAPI(); 