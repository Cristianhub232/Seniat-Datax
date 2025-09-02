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

async function checkNotificationsDB() {
  try {
    console.log('🔍 Verificando notificaciones en la base de datos...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar si la tabla existe
    console.log('2. Verificando tabla de notificaciones...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'app' AND table_name = 'notifications'
    `);
    
    if (tables.length === 0) {
      console.log('❌ La tabla app.notifications no existe');
      return;
    }
    console.log('✅ Tabla app.notifications existe\n');

    // 3. Contar total de notificaciones
    console.log('3. Contando notificaciones...');
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM app.notifications
    `);
    const total = countResult[0].total;
    console.log(`📊 Total de notificaciones: ${total}\n`);

    // 4. Listar todas las notificaciones
    console.log('4. Listando todas las notificaciones:');
    const [notifications] = await sequelize.query(`
      SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.priority,
        n.is_active,
        n.created_at,
        n.expires_at,
        u.username as creator_username,
        u.first_name as creator_nombre,
        u.last_name as creator_apellido
      FROM app.notifications n
      LEFT JOIN app.users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
    `);

    if (notifications.length === 0) {
      console.log('📭 No hay notificaciones en la base de datos');
    } else {
      notifications.forEach((notification, index) => {
        console.log(`\n📋 Notificación ${index + 1}:`);
        console.log(`   ID: ${notification.id}`);
        console.log(`   Título: ${notification.title}`);
        console.log(`   Tipo: ${notification.type}`);
        console.log(`   Prioridad: ${notification.priority}`);
        console.log(`   Activa: ${notification.is_active}`);
        console.log(`   Creada: ${notification.created_at}`);
        console.log(`   Expira: ${notification.expires_at}`);
        console.log(`   Creador: ${notification.creator_nombre} ${notification.creator_apellido} (${notification.creator_username})`);
      });
    }

    // 5. Estadísticas por tipo
    console.log('\n5. Estadísticas por tipo:');
    const [typeStats] = await sequelize.query(`
      SELECT 
        type,
        COUNT(*) as count
      FROM app.notifications
      GROUP BY type
      ORDER BY count DESC
    `);
    
    typeStats.forEach(stat => {
      console.log(`   ${stat.type}: ${stat.count}`);
    });

    // 6. Estadísticas por prioridad
    console.log('\n6. Estadísticas por prioridad:');
    const [priorityStats] = await sequelize.query(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM app.notifications
      GROUP BY priority
      ORDER BY count DESC
    `);
    
    priorityStats.forEach(stat => {
      console.log(`   ${stat.priority}: ${stat.count}`);
    });

    // 7. Verificar notificaciones activas vs inactivas
    console.log('\n7. Estado de notificaciones:');
    const [statusStats] = await sequelize.query(`
      SELECT 
        is_active,
        COUNT(*) as count
      FROM app.notifications
      GROUP BY is_active
    `);
    
    statusStats.forEach(stat => {
      const status = stat.is_active ? 'Activas' : 'Inactivas';
      console.log(`   ${status}: ${stat.count}`);
    });

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
checkNotificationsDB(); 