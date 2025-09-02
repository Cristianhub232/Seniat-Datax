require('dotenv').config({ path: '.env.local' });

const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const databaseUrl = process.env.DATABASE_URL || 'postgresql://ont:123456@localhost:5432/xmls';

// Crear conexión específica para autenticación
const authSequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: console.log,
  schema: 'app',
  define: {
    schema: 'app'
  }
});

async function testCreateUser() {
  try {
    console.log('🚀 Probando creación de usuario...');
    console.log('🎯 Base de datos:', databaseUrl);
    console.log('🎯 Esquema: app');
    console.log('');
    
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // 1. Verificar roles disponibles
    console.log('\n👥 Verificando roles disponibles...');
    const [roles] = await authSequelize.query(`
      SELECT id, name, description, status
      FROM app.roles
      WHERE status = 'active'
      ORDER BY name;
    `);
    
    console.log(`📊 Roles activos encontrados: ${roles.length}`);
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description}`);
    });
    
    if (roles.length === 0) {
      console.error('❌ No hay roles activos disponibles');
      return;
    }
    
    // 2. Verificar si el usuario de prueba ya existe
    console.log('\n🔍 Verificando si el usuario de prueba existe...');
    const [existingUser] = await authSequelize.query(`
      SELECT id, username, email, status
      FROM app.users
      WHERE username = 'testuser';
    `);
    
    if (existingUser.length > 0) {
      console.log('ℹ️  Usuario de prueba ya existe, eliminando...');
      await authSequelize.query(`
        DELETE FROM app.users WHERE username = 'testuser';
      `);
      console.log('✅ Usuario de prueba eliminado');
    }
    
    // 3. Crear hash de contraseña
    console.log('\n🔐 Generando hash de contraseña...');
    const password = 'test123';
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Hash generado correctamente');
    
    // 4. Obtener rol user
    const userRole = roles.find(r => r.name === 'user');
    if (!userRole) {
      console.error('❌ Rol "user" no encontrado');
      return;
    }
    
    // 5. Crear usuario de prueba
    console.log('\n👤 Creando usuario de prueba...');
    const [newUser] = await authSequelize.query(`
      INSERT INTO app.users (
        username, 
        email, 
        password_hash, 
        role_id, 
        status, 
        first_name, 
        last_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id, username, email, status, created_at;
    `, {
      replacements: [
        'testuser',
        'testuser@siront.com',
        passwordHash,
        userRole.id,
        'active',
        'Usuario',
        'Prueba'
      ]
    });
    
    console.log('✅ Usuario creado exitosamente:');
    console.log(`  - ID: ${newUser[0].id}`);
    console.log(`  - Username: ${newUser[0].username}`);
    console.log(`  - Email: ${newUser[0].email}`);
    console.log(`  - Status: ${newUser[0].status}`);
    console.log(`  - Creado: ${newUser[0].created_at}`);
    
    // 6. Verificar que el usuario se creó correctamente
    console.log('\n🔍 Verificando usuario creado...');
    const [createdUser] = await authSequelize.query(`
      SELECT u.id, u.username, u.email, u.status, r.name as role_name
      FROM app.users u
      LEFT JOIN app.roles r ON u.role_id = r.id
      WHERE u.username = 'testuser';
    `);
    
    if (createdUser.length > 0) {
      console.log('✅ Usuario verificado correctamente:');
      console.log(`  - Username: ${createdUser[0].username}`);
      console.log(`  - Email: ${createdUser[0].email}`);
      console.log(`  - Role: ${createdUser[0].role_name}`);
      console.log(`  - Status: ${createdUser[0].status}`);
    } else {
      console.error('❌ Error: Usuario no encontrado después de la creación');
    }
    
    // 7. Probar login con el nuevo usuario
    console.log('\n🔐 Probando login con el nuevo usuario...');
    const [userForLogin] = await authSequelize.query(`
      SELECT id, username, password_hash, status
      FROM app.users
      WHERE username = 'testuser';
    `);
    
    if (userForLogin.length > 0) {
      const isValidPassword = await bcrypt.compare(password, userForLogin[0].password_hash);
      console.log(`✅ Verificación de contraseña: ${isValidPassword ? 'Correcta' : 'Incorrecta'}`);
      
      if (isValidPassword) {
        console.log('✅ Login funcionaría correctamente');
      } else {
        console.error('❌ Error: La contraseña no coincide');
      }
    }
    
    console.log('\n🎉 ¡Prueba de creación de usuario completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await authSequelize.close();
  }
}

testCreateUser(); 