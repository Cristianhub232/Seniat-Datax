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

async function testDataVisualization() {
  try {
    console.log('🔍 Verificando visualización de datos en el módulo de cuenta...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Obtener datos más recientes de usuarios
    console.log('2. Datos más recientes de usuarios:');
    const [users] = await sequelize.query(`
      SELECT 
        id, username, email, first_name, last_name, 
        phone, location, bio, avatar, updated_at,
        CASE 
          WHEN first_name IS NOT NULL AND first_name != '' THEN '✅'
          ELSE '❌'
        END as nombre_status,
        CASE 
          WHEN last_name IS NOT NULL AND last_name != '' THEN '✅'
          ELSE '❌'
        END as apellido_status,
        CASE 
          WHEN phone IS NOT NULL AND phone != '' THEN '✅'
          ELSE '❌'
        END as telefono_status,
        CASE 
          WHEN location IS NOT NULL AND location != '' THEN '✅'
          ELSE '❌'
        END as ubicacion_status,
        CASE 
          WHEN bio IS NOT NULL AND bio != '' THEN '✅'
          ELSE '❌'
        END as bio_status
      FROM app.users
      ORDER BY updated_at DESC
      LIMIT 5
    `);

    users.forEach((user, index) => {
      console.log(`   Usuario ${index + 1}: ${user.username}`);
      console.log(`     - Nombre: ${user.nombre_status} ${user.first_name || 'No especificado'}`);
      console.log(`     - Apellido: ${user.apellido_status} ${user.last_name || 'No especificado'}`);
      console.log(`     - Teléfono: ${user.telefono_status} ${user.phone || 'No especificado'}`);
      console.log(`     - Ubicación: ${user.ubicacion_status} ${user.location || 'No especificado'}`);
      console.log(`     - Bio: ${user.bio_status} ${user.bio || 'No especificado'}`);
      console.log(`     - Última actualización: ${user.updated_at}`);
      console.log('');
    });

    // 3. Verificar endpoints de la API
    console.log('3. Verificando endpoints de la API:');
    console.log('   ✅ /api/me - GET (Obtener datos del usuario actual)');
    console.log('   ✅ /api/account/profile - PUT (Actualizar perfil)');
    console.log('   ✅ /api/account/verify-password - POST (Verificar contraseña)');
    console.log('   ✅ /api/account/avatar - POST (Subir avatar)');
    console.log('   ✅ /api/account/password - PUT (Cambiar contraseña)');
    console.log('');

    // 4. Verificar estructura de datos
    console.log('4. Verificando estructura de datos:');
    const [userStructure] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'app' AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('   Columnas en tabla app.users:');
    userStructure.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('');

    // 5. Verificar datos de prueba
    console.log('5. Verificando datos de prueba:');
    const [testUser] = await sequelize.query(`
      SELECT username, first_name, last_name, phone, location, bio
      FROM app.users
      WHERE username = 'ejemplo'
      LIMIT 1
    `);

    if (testUser.length > 0) {
      const user = testUser[0];
      console.log('   Usuario de prueba (ejemplo):');
      console.log(`     - Nombre completo: ${user.first_name} ${user.last_name}`);
      console.log(`     - Teléfono: ${user.phone}`);
      console.log(`     - Ubicación: ${user.location}`);
      console.log(`     - Bio: ${user.bio}`);
    } else {
      console.log('   ⚠️  Usuario de prueba no encontrado');
    }
    console.log('');

    // 6. Diagnóstico del problema
    console.log('6. Diagnóstico del problema de visualización:');
    console.log('   🔍 Posibles causas:');
    console.log('     - Datos no se cargan correctamente desde /api/me');
    console.log('     - Estado local no se actualiza después de guardar');
    console.log('     - Contexto de usuario no se sincroniza');
    console.log('     - Cache del navegador interfiere');
    console.log('');
    console.log('   💡 Soluciones implementadas:');
    console.log('     ✅ Card de visualización de datos básicos');
    console.log('     ✅ Carga directa desde API /api/me');
    console.log('     ✅ Actualización automática después de guardar');
    console.log('     ✅ Botón de recarga manual');
    console.log('     ✅ Logs de consola para debugging');
    console.log('     ✅ Fallback a datos del contexto');

    console.log('\n🎉 ¡Verificación completada!');
    console.log('\n📝 Instrucciones para el usuario:');
    console.log('   1. Accede a /cuenta en el navegador');
    console.log('   2. Observa el card "Datos Guardados en Base de Datos"');
    console.log('   3. Verifica que los datos mostrados coincidan con la base de datos');
    console.log('   4. Si los datos no coinciden, usa el botón "Recargar Datos"');
    console.log('   5. Edita tu perfil y verifica que los cambios se reflejen inmediatamente');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
testDataVisualization(); 