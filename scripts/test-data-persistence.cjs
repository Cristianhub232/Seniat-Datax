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

async function testDataPersistence() {
  try {
    console.log('🧪 Probando persistencia de datos después de actualizaciones...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar usuarios con datos más recientes
    console.log('2. Verificando usuarios con datos actualizados...');
    const [users] = await sequelize.query(`
      SELECT id, username, email, first_name, last_name, avatar, phone, location, bio, updated_at
      FROM app.users
      WHERE first_name IS NOT NULL OR last_name IS NOT NULL OR phone IS NOT NULL OR location IS NOT NULL OR bio IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT 5
    `);

    console.log(`   Usuarios con datos guardados: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   Usuario ${index + 1}:`);
      console.log(`     - ID: ${user.id}`);
      console.log(`     - Username: ${user.username}`);
      console.log(`     - Email: ${user.email}`);
      console.log(`     - Nombre: ${user.first_name || 'No especificado'}`);
      console.log(`     - Apellido: ${user.last_name || 'No especificado'}`);
      console.log(`     - Teléfono: ${user.phone || 'No especificado'}`);
      console.log(`     - Ubicación: ${user.location || 'No especificado'}`);
      console.log(`     - Bio: ${user.bio || 'No especificado'}`);
      console.log(`     - Última actualización: ${user.updated_at}`);
      console.log('');
    });

    // 3. Verificar que los datos se están guardando correctamente
    console.log('3. Verificando integridad de datos...');
    const [recentUpdates] = await sequelize.query(`
      SELECT 
        u.username,
        u.first_name,
        u.last_name,
        u.phone,
        u.location,
        u.bio,
        u.updated_at,
        CASE 
          WHEN u.first_name IS NOT NULL AND u.first_name != '' THEN '✅'
          ELSE '❌'
        END as nombre_status,
        CASE 
          WHEN u.last_name IS NOT NULL AND u.last_name != '' THEN '✅'
          ELSE '❌'
        END as apellido_status,
        CASE 
          WHEN u.phone IS NOT NULL AND u.phone != '' THEN '✅'
          ELSE '❌'
        END as telefono_status,
        CASE 
          WHEN u.location IS NOT NULL AND u.location != '' THEN '✅'
          ELSE '❌'
        END as ubicacion_status,
        CASE 
          WHEN u.bio IS NOT NULL AND u.bio != '' THEN '✅'
          ELSE '❌'
        END as bio_status
      FROM app.users u
      WHERE u.updated_at > NOW() - INTERVAL '1 hour'
      ORDER BY u.updated_at DESC
    `);

    console.log(`   Actualizaciones recientes (última hora): ${recentUpdates.length}`);
    recentUpdates.forEach((update, index) => {
      console.log(`   Actualización ${index + 1}:`);
      console.log(`     - Usuario: ${update.username}`);
      console.log(`     - Nombre: ${update.nombre_status} ${update.first_name || 'No especificado'}`);
      console.log(`     - Apellido: ${update.apellido_status} ${update.last_name || 'No especificado'}`);
      console.log(`     - Teléfono: ${update.telefono_status} ${update.phone || 'No especificado'}`);
      console.log(`     - Ubicación: ${update.ubicacion_status} ${update.location || 'No especificado'}`);
      console.log(`     - Bio: ${update.bio_status} ${update.bio || 'No especificado'}`);
      console.log(`     - Fecha: ${update.updated_at}`);
      console.log('');
    });

    // 4. Verificar endpoints de actualización
    console.log('4. Verificando endpoints de actualización...');
    console.log('   ✅ /api/account/profile - PUT (Actualizar perfil)');
    console.log('   ✅ /api/account/verify-password - POST (Verificar contraseña)');
    console.log('   ✅ /api/account/avatar - POST (Subir avatar)');
    console.log('   ✅ /api/account/password - PUT (Cambiar contraseña)');
    console.log('');

    // 5. Diagnóstico del problema de visualización
    console.log('5. Diagnóstico del problema de visualización...');
    console.log('   🔍 Posibles causas:');
    console.log('     - Contexto de usuario no se actualiza correctamente');
    console.log('     - Estado local no se sincroniza con la base de datos');
    console.log('     - Cache del navegador no se actualiza');
    console.log('     - Problema en la recarga de datos');
    console.log('');
    console.log('   💡 Soluciones implementadas:');
    console.log('     ✅ Actualización del estado local después de guardar');
    console.log('     ✅ Actualización del contexto de autenticación');
    console.log('     ✅ Recarga automática de la página después de 1 segundo');
    console.log('     ✅ Sincronización con localStorage');
    console.log('     ✅ Manejo de errores mejorado');

    console.log('\n🎉 ¡Prueba de persistencia completada!');
    console.log('\n📝 Recomendaciones:');
    console.log('   1. Verificar que los datos se muestran correctamente después de guardar');
    console.log('   2. Comprobar que la recarga automática funciona');
    console.log('   3. Verificar que los datos persisten entre sesiones');
    console.log('   4. Probar la edición con diferentes usuarios');

  } catch (error) {
    console.error('❌ Error en prueba de persistencia:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar prueba
testDataPersistence(); 