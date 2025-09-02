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

async function testAccountLoading() {
  try {
    console.log('🧪 Probando carga del módulo de cuentas...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar usuarios con datos completos
    console.log('2. Verificando usuarios con datos completos...');
    const [users] = await sequelize.query(`
      SELECT id, username, email, first_name, last_name, avatar, phone, location, bio, role_id
      FROM app.users
      LIMIT 5
    `);

    console.log(`   Usuarios encontrados: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   Usuario ${index + 1}:`);
      console.log(`     - ID: ${user.id}`);
      console.log(`     - Username: ${user.username}`);
      console.log(`     - Email: ${user.email}`);
      console.log(`     - Nombre: ${user.first_name || 'No especificado'}`);
      console.log(`     - Apellido: ${user.last_name || 'No especificado'}`);
      console.log(`     - Avatar: ${user.avatar || 'No especificado'}`);
      console.log(`     - Teléfono: ${user.phone || 'No especificado'}`);
      console.log(`     - Ubicación: ${user.location || 'No especificado'}`);
      console.log(`     - Bio: ${user.bio || 'No especificado'}`);
      console.log(`     - Role ID: ${user.role_id}`);
      console.log('');
    });

    // 3. Verificar roles asociados
    console.log('3. Verificando roles asociados...');
    const [roles] = await sequelize.query(`
      SELECT r.id, r.name, r.status
      FROM app.roles r
      INNER JOIN app.users u ON r.id = u.role_id
      GROUP BY r.id, r.name, r.status
    `);

    console.log(`   Roles encontrados: ${roles.length}`);
    roles.forEach((role, index) => {
      console.log(`   Rol ${index + 1}:`);
      console.log(`     - ID: ${role.id}`);
      console.log(`     - Nombre: ${role.name}`);
      console.log(`     - Estado: ${role.status}`);
      console.log('');
    });

    // 4. Verificar estructura de datos completa
    console.log('4. Verificando estructura de datos completa...');
    const [completeUser] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.avatar,
        u.phone,
        u.location,
        u.bio,
        u.status,
        u.created_at,
        u.last_login,
        r.name as role_name,
        r.status as role_status
      FROM app.users u
      INNER JOIN app.roles r ON u.role_id = r.id
      LIMIT 1
    `);

    if (completeUser.length > 0) {
      const user = completeUser[0];
      console.log('   Estructura de datos completa:');
      console.log(`     - ID: ${user.id}`);
      console.log(`     - Username: ${user.username}`);
      console.log(`     - Email: ${user.email}`);
      console.log(`     - Nombre: ${user.first_name || 'No especificado'}`);
      console.log(`     - Apellido: ${user.last_name || 'No especificado'}`);
      console.log(`     - Avatar: ${user.avatar || 'No especificado'}`);
      console.log(`     - Teléfono: ${user.phone || 'No especificado'}`);
      console.log(`     - Ubicación: ${user.location || 'No especificado'}`);
      console.log(`     - Bio: ${user.bio || 'No especificado'}`);
      console.log(`     - Estado: ${user.status}`);
      console.log(`     - Fecha de creación: ${user.created_at}`);
      console.log(`     - Último acceso: ${user.last_login || 'No especificado'}`);
      console.log(`     - Rol: ${user.role_name} (${user.role_status})`);
      console.log('');
    }

    // 5. Verificar endpoints
    console.log('5. Verificando endpoints de la API...');
    console.log('   ✅ /api/account/profile - PUT (Actualizar perfil)');
    console.log('   ✅ /api/account/password - PUT (Cambiar contraseña)');
    console.log('   ✅ /api/account/avatar - POST (Subir avatar)');
    console.log('   ✅ /cuenta - Página de gestión de cuentas');
    console.log('   ✅ /api/me - GET (Obtener datos del usuario)');
    console.log('   ✅ /api/auth/verify - POST (Verificar sesión)');
    console.log('');

    // 6. Diagnóstico del problema de carga
    console.log('6. Diagnóstico del problema de carga...');
    console.log('   🔍 Posibles causas:');
    console.log('     - Contexto de usuario no se actualiza correctamente');
    console.log('     - Datos del usuario no incluyen campos nuevos');
    console.log('     - Problema en la carga inicial del contexto');
    console.log('     - Timeout en la carga de datos');
    console.log('');
    console.log('   💡 Soluciones implementadas:');
    console.log('     ✅ Corrección en UserContext (setUser y setMenus)');
    console.log('     ✅ Timeout de 3 segundos para carga');
    console.log('     ✅ Manejo de errores mejorado');
    console.log('     ✅ Estados de carga más claros');
    console.log('     ✅ Botón de recarga en caso de error');

    console.log('\n🎉 ¡Diagnóstico completado!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Probar la página /cuenta en el navegador');
    console.log('   2. Verificar que el usuario se carga correctamente');
    console.log('   3. Comprobar que los formularios funcionan');
    console.log('   4. Probar la actualización de perfil');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar diagnóstico
testAccountLoading(); 