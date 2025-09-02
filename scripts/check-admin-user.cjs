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

async function checkAdminUser() {
  const sequelize = new Sequelize(dbConfig);
  
  try {
    console.log('🔍 Verificando usuario admin...');
    
    // Obtener usuario admin
    const [users] = await sequelize.query(`
      SELECT u.username, u.email, u.password_hash, u.status, r.name as role_name
      FROM app.users u
      JOIN app.roles r ON u.role_id = r.id
      WHERE u.username = 'admin'
    `);
    
    if (users.length === 0) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    const adminUser = users[0];
    
    console.log('✅ Usuario admin encontrado:');
    console.log('   Username:', adminUser.username);
    console.log('   Email:', adminUser.email);
    console.log('   Rol:', adminUser.role_name);
    console.log('   Estado:', adminUser.status ? 'Activo' : 'Inactivo');
    console.log('   Password Hash:', adminUser.password_hash);
    
    // Verificar si la contraseña actual es "admin123"
    const isValidPassword = await bcrypt.compare('admin123', adminUser.password_hash);
    
    if (isValidPassword) {
      console.log('✅ La contraseña actual es: admin123');
    } else {
      console.log('❌ La contraseña no es admin123');
      
      // Generar nueva contraseña hasheada para admin123
      const newHashedPassword = await bcrypt.hash('admin123', 10);
      
      console.log('🔧 Actualizando contraseña a admin123...');
      
      await sequelize.query(`
        UPDATE app.users 
        SET password_hash = ? 
        WHERE username = 'admin'
      `, {
        replacements: [newHashedPassword]
      });
      
      console.log('✅ Contraseña actualizada exitosamente');
    }
    
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Email: ' + adminUser.email);
    console.log('   Contraseña: admin123');
    
  } catch (error) {
    console.error('❌ Error verificando usuario admin:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAdminUser(); 