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

async function createAdminUser() {
  const sequelize = new Sequelize(dbConfig);
  
  try {
    console.log('🔍 Verificando usuarios existentes...');
    
    // Verificar usuarios existentes
    const [existingUsers] = await sequelize.query('SELECT username, email FROM app.users;');
    
    console.log('Usuarios existentes:');
    existingUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email})`);
    });
    
    // Verificar si ya existe usuario admin
    const [adminExists] = await sequelize.query('SELECT username FROM app.users WHERE username = \'admin\';');
    
    if (adminExists.length > 0) {
      console.log('✅ Usuario admin ya existe');
    } else {
      console.log('📝 Creando usuario admin...');
      
      // Obtener rol admin
      const [adminRole] = await sequelize.query('SELECT id FROM app.roles WHERE name = \'admin\';');
      
      if (adminRole.length === 0) {
        console.log('❌ Rol admin no encontrado');
        return;
      }
      
      // Hashear contraseña
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Crear usuario admin
      await sequelize.query(`
        INSERT INTO app.users (username, email, password_hash, role_id, status)
        VALUES (?, ?, ?, ?, true)
      `, {
        replacements: ['admin', 'admin@siront.com', hashedPassword, adminRole[0].id]
      });
      
      console.log('✅ Usuario admin creado exitosamente');
    }
    
    // Verificar credenciales
    const [adminUser] = await sequelize.query(`
      SELECT u.username, u.email, u.password_hash, r.name as role_name
      FROM app.users u
      JOIN app.roles r ON u.role_id = r.id
      WHERE u.username = 'admin'
    `);
    
    if (adminUser.length > 0) {
      const user = adminUser[0];
      const isValidPassword = await bcrypt.compare('admin123', user.password_hash);
      
      console.log('\n📝 Credenciales del usuario admin:');
      console.log('   Usuario: admin');
      console.log('   Email:', user.email);
      console.log('   Contraseña: admin123');
      console.log('   Rol:', user.role_name);
      console.log('   Contraseña válida:', isValidPassword ? 'Sí' : 'No');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAdminUser(); 