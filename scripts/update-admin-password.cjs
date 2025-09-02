require('dotenv').config({ path: '.env.local' });

const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const databaseUrl = process.env.DATABASE_URL || 'postgresql://ont:123456@localhost:5432/xmls';

// Crear conexión específica para autenticación (esquema app)
const authSequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: console.log,
  schema: 'app',
  define: {
    schema: 'app'
  }
});

async function updateAdminPassword() {
  try {
    console.log('🔍 Actualizando contraseña del usuario admin...');
    console.log('🎯 Base de datos:', databaseUrl);
    console.log('🎯 Esquema: app');
    console.log('');
    
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Generar nuevo hash para la contraseña admin123
    const newPassword = 'admin123';
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔑 Nueva contraseña:', newPassword);
    console.log('🔐 Nuevo hash:', newHash.substring(0, 20) + '...');
    
    // Actualizar la contraseña del usuario admin
    const [updatedRows] = await authSequelize.query(`
      UPDATE app.users 
      SET password_hash = ? 
      WHERE username = 'admin'
    `, {
      replacements: [newHash]
    });
    
    console.log('✅ Contraseña actualizada para el usuario admin');
    
    // Verificar que se actualizó correctamente
    const [users] = await authSequelize.query(`
      SELECT username, email, password_hash 
      FROM app.users 
      WHERE username = 'admin'
    `);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Usuario admin verificado:');
      console.log('  - Username:', user.username);
      console.log('  - Email:', user.email);
      console.log('  - Password hash:', user.password_hash.substring(0, 20) + '...');
      
      // Probar la nueva contraseña
      const isValid = await bcrypt.compare(newPassword, user.password_hash);
      console.log('🔍 Verificación de contraseña:', isValid ? '✅ Válida' : '❌ Inválida');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await authSequelize.close();
  }
}

updateAdminPassword(); 