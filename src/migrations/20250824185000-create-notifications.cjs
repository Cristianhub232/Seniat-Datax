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

async function createNotificationsTable() {
  try {
    console.log('📢 Creando tabla de notificaciones...\n');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Crear tabla de notificaciones
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS app.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
        priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        created_by UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabla app.notifications creada exitosamente\n');

    // Crear índices para optimizar consultas
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON app.notifications(created_by);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_active ON app.notifications(is_active);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON app.notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_priority ON app.notifications(priority);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON app.notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON app.notifications(expires_at);
    `);

    console.log('✅ Índices creados exitosamente\n');

    // Insertar algunas notificaciones de ejemplo
    await sequelize.query(`
      INSERT INTO app.notifications (title, message, type, priority, created_by, is_active, expires_at)
      VALUES 
        ('Bienvenido al Sistema SIRONT', 'El sistema SIRONT está funcionando correctamente. Todas las funcionalidades están disponibles.', 'success', 'medium', (SELECT id FROM app.users LIMIT 1), true, CURRENT_TIMESTAMP + INTERVAL '30 days'),
        ('Mantenimiento Programado', 'Se realizará mantenimiento del sistema el próximo domingo de 2:00 AM a 6:00 AM.', 'warning', 'high', (SELECT id FROM app.users LIMIT 1), true, CURRENT_TIMESTAMP + INTERVAL '7 days'),
        ('Nueva Funcionalidad Disponible', 'El módulo de notificaciones ya está disponible para todos los usuarios.', 'info', 'low', (SELECT id FROM app.users LIMIT 1), true, CURRENT_TIMESTAMP + INTERVAL '15 days')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Notificaciones de ejemplo insertadas\n');

    // Verificar la estructura de la tabla
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'app' AND table_name = 'notifications'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estructura de la tabla app.notifications:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });

    // Verificar datos insertados
    const [notifications] = await sequelize.query(`
      SELECT id, title, type, priority, is_active, created_at
      FROM app.notifications
      ORDER BY created_at DESC
    `);

    console.log('\n📊 Notificaciones creadas:');
    notifications.forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.title} (${notification.type.toUpperCase()}) - ${notification.is_active ? '✅ Activa' : '❌ Inactiva'}`);
    });

    console.log('\n🎉 ¡Tabla de notificaciones creada exitosamente!');
    console.log('🚀 El módulo de notificaciones está listo para usar');

  } catch (error) {
    console.error('❌ Error creando tabla de notificaciones:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar migración
createNotificationsTable(); 