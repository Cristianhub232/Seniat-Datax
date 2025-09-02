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

async function updateUserToAdmin() {
  try {
    console.log('👑 Actualizando usuario a rol admin...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Obtener el ID del rol admin
    console.log('2. Obteniendo ID del rol admin...');
    const [adminRole] = await sequelize.query(`
      SELECT id, name FROM app.roles WHERE name = 'admin'
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ No se encontró el rol admin');
      return;
    }
    
    const adminRoleId = adminRole[0].id;
    console.log(`✅ Rol admin encontrado: ${adminRole[0].name} (ID: ${adminRoleId})\n`);

    // 3. Mostrar usuarios disponibles
    console.log('3. Usuarios disponibles:');
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
    `);

    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.username})`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Role actual: ${user.role_name} (${user.role_id})`);
      console.log('');
    });

    // 4. Actualizar el primer usuario a admin (o puedes especificar uno)
    const targetUserId = users[0].id;
    const targetUsername = users[0].username;
    
    console.log(`4. Actualizando usuario "${targetUsername}" a rol admin...`);
    
    const [updateResult] = await sequelize.query(`
      UPDATE app.users 
      SET role_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, {
      bind: [adminRoleId, targetUserId]
    });

    console.log('✅ Usuario actualizado exitosamente\n');

    // 5. Verificar la actualización
    console.log('5. Verificando actualización...');
    const [updatedUser] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.role_id,
        r.name as role_name
      FROM app.users u
      LEFT JOIN app.roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, {
      bind: [targetUserId]
    });

    if (updatedUser.length > 0) {
      const user = updatedUser[0];
      console.log(`✅ Usuario actualizado:`);
      console.log(`   Nombre: ${user.first_name} ${user.last_name}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role_name} (${user.role_id})`);
    }

    console.log('\n🎉 ¡Usuario actualizado a admin exitosamente!');
    console.log(`\n💡 Ahora puedes iniciar sesión con el usuario "${targetUsername}" y ver el botón "Nueva Notificación"`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar actualización
updateUserToAdmin(); 