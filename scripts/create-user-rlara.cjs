const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const dbConfig = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

async function createUserRlara() {
  const sequelize = new Sequelize(dbConfig);
  
  try {
    console.log('🔍 Verificando usuarios existentes...');
    
    // Verificar usuarios existentes
    const [existingUsers] = await sequelize.query('SELECT username, email FROM app.users;');
    
    console.log('Usuarios existentes:');
    existingUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email})`);
    });
    
    // Verificar si ya existe usuario rlara
    const [rlaraExists] = await sequelize.query('SELECT username FROM app.users WHERE username = \'rlara\';');
    
    if (rlaraExists.length > 0) {
      console.log('✅ Usuario rlara ya existe');
      
      // Verificar si está activo
      const [rlaraStatus] = await sequelize.query('SELECT status FROM app.users WHERE username = \'rlara\';');
      if (rlaraStatus.length > 0) {
        console.log('Estado del usuario rlara:', rlaraStatus[0].status ? 'Activo' : 'Inactivo');
        
        if (!rlaraStatus[0].status) {
          console.log('🔄 Activando usuario rlara...');
          await sequelize.query('UPDATE app.users SET status = true WHERE username = \'rlara\';');
          console.log('✅ Usuario rlara activado');
        }
      }
    } else {
      console.log('📝 Creando usuario rlara...');
      
      // Obtener rol admin (o el rol que prefieras)
      const [adminRole] = await sequelize.query('SELECT id FROM app.roles WHERE name = \'admin\';');
      
      if (adminRole.length === 0) {
        console.log('❌ Rol admin no encontrado, intentando con otros roles...');
        const [roles] = await sequelize.query('SELECT id, name FROM app.roles;');
        console.log('Roles disponibles:', roles);
        
        if (roles.length === 0) {
          console.log('❌ No hay roles disponibles');
          return;
        }
        
        // Usar el primer rol disponible
        const roleId = roles[0].id;
        console.log(`Usando rol: ${roles[0].name}`);
      }
      
      // Hashear contraseña
      const hashedPassword = await bcrypt.hash('rlara123', 10);
      
      // Crear usuario rlara
      await sequelize.query(`
        INSERT INTO app.users (username, email, password_hash, role_id, status, first_name, last_name)
        VALUES (?, ?, ?, ?, true, ?, ?)
      `, {
        replacements: ['rlara', 'rlara@seniat.gob.ve', hashedPassword, adminRole[0].id, 'Roberto', 'Lara']
      });
      
      console.log('✅ Usuario rlara creado exitosamente');
    }
    
    // Verificar credenciales
    const [rlaraUser] = await sequelize.query(`
      SELECT u.username, u.email, u.password_hash, u.status, r.name as role_name
      FROM app.users u
      JOIN app.roles r ON u.role_id = r.id
      WHERE u.username = 'rlara'
    `);
    
    if (rlaraUser.length > 0) {
      const user = rlaraUser[0];
      const isValidPassword = await bcrypt.compare('rlara123', user.password_hash);
      
      console.log('\n📝 Credenciales del usuario rlara:');
      console.log('   Usuario: rlara');
      console.log('   Email:', user.email);
      console.log('   Contraseña: rlara123');
      console.log('   Rol:', user.role_name);
      console.log('   Estado:', user.status ? 'Activo' : 'Inactivo');
      console.log('   Contraseña válida:', isValidPassword ? 'Sí' : 'No');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createUserRlara(); 