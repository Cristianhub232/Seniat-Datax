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

async function checkUserRole() {
  try {
    console.log('🔍 Verificando roles de usuario...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar tabla de usuarios
    console.log('2. Verificando tabla de usuarios...');
    const [users] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.role_id,
        r.name as role_name
      FROM app.users u
      LEFT JOIN app.roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
      LIMIT 10
    `);

    console.log('📋 Usuarios encontrados:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.username})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Role ID: ${user.role_id}`);
      console.log(`      Role Name: ${user.role_name}`);
      console.log('');
    });

    // 3. Verificar tabla de roles
    console.log('3. Verificando tabla de roles...');
    const [roles] = await sequelize.query(`
      SELECT id, name, description, status
      FROM app.roles
      ORDER BY name
    `);

    console.log('🎭 Roles disponibles:');
    roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name} (ID: ${role.id})`);
      console.log(`      Descripción: ${role.description}`);
      console.log(`      Estado: ${role.status}`);
      console.log('');
    });

    // 4. Verificar usuarios con rol admin
    console.log('4. Verificando usuarios con rol admin...');
    const [adminUsers] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.role_id,
        r.name as role_name
      FROM app.users u
      LEFT JOIN app.roles r ON u.role_id = r.id
      WHERE r.name = 'admin' OR u.role_id = 'admin'
    `);

    if (adminUsers.length > 0) {
      console.log('👑 Usuarios con rol admin:');
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.username})`);
        console.log(`      Role ID: ${user.role_id}`);
        console.log(`      Role Name: ${user.role_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron usuarios con rol admin');
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
checkUserRole(); 