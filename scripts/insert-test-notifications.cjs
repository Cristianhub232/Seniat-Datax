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

async function insertTestNotifications() {
  try {
    console.log('📢 Insertando notificaciones de prueba...\n');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Obtener un usuario para usar como creador
    const [users] = await sequelize.query(`
      SELECT id FROM app.users LIMIT 1
    `);

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    const creatorId = users[0].id;
    console.log('👤 Usuario creador:', creatorId);

    // Notificaciones de prueba
    const testNotifications = [
      {
        title: 'Bienvenido al Sistema SIRONT',
        message: 'El sistema SIRONT está funcionando correctamente. Todas las funcionalidades están disponibles para su uso.',
        type: 'success',
        priority: 'medium',
        is_active: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      },
      {
        title: 'Mantenimiento Programado',
        message: 'Se realizará mantenimiento del sistema el próximo domingo de 2:00 AM a 6:00 AM. Durante este tiempo el sistema estará temporalmente fuera de servicio.',
        type: 'warning',
        priority: 'high',
        is_active: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      },
      {
        title: 'Nueva Funcionalidad Disponible',
        message: 'El módulo de notificaciones ya está disponible para todos los usuarios. Puede crear y gestionar notificaciones del sistema.',
        type: 'info',
        priority: 'low',
        is_active: true,
        expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 días
      },
      {
        title: 'Actualización de Seguridad',
        message: 'Se ha aplicado una actualización de seguridad importante. Se recomienda cambiar su contraseña si no lo ha hecho recientemente.',
        type: 'warning',
        priority: 'high',
        is_active: true,
        expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 días
      },
      {
        title: 'Reporte Mensual Disponible',
        message: 'El reporte mensual de actividades está disponible para su revisión. Acceda al módulo de reportes para más detalles.',
        type: 'info',
        priority: 'medium',
        is_active: true,
        expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 días
      }
    ];

    console.log('📝 Insertando notificaciones...\n');

    for (let i = 0; i < testNotifications.length; i++) {
      const notification = testNotifications[i];
      
      const insertQuery = `
        INSERT INTO app.notifications (
          title, message, type, priority, created_by, is_active, expires_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING id, title, type, priority, is_active
      `;

      const [result] = await sequelize.query(insertQuery, {
        bind: [
          notification.title,
          notification.message,
          notification.type,
          notification.priority,
          creatorId,
          notification.is_active,
          notification.expires_at
        ],
        type: 'SELECT'
      });

      if (result.length > 0) {
        const inserted = result[0];
        console.log(`✅ ${i + 1}. ${inserted.title} (${inserted.type.toUpperCase()}) - ${inserted.is_active ? 'Activa' : 'Inactiva'}`);
      }
    }

    // Verificar notificaciones insertadas
    const [allNotifications] = await sequelize.query(`
      SELECT id, title, type, priority, is_active, created_at
      FROM app.notifications
      ORDER BY created_at DESC
    `);

    console.log('\n📊 Total de notificaciones en la base de datos:', allNotifications.length);
    console.log('\n📋 Lista completa:');
    allNotifications.forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.title} (${notification.type.toUpperCase()}) - ${notification.is_active ? '✅ Activa' : '❌ Inactiva'}`);
    });

    console.log('\n🎉 ¡Notificaciones de prueba insertadas exitosamente!');
    console.log('🚀 El módulo de notificaciones debería funcionar correctamente ahora');

  } catch (error) {
    console.error('❌ Error insertando notificaciones de prueba:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar inserción
insertTestNotifications(); 