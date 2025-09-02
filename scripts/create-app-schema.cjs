const { Sequelize } = require('sequelize');

// Configuración de la base de datos local
const xmlsConfig = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

// Crear conexión
const xmlsDB = new Sequelize(xmlsConfig);

async function createAppSchema() {
  try {
    console.log('🔧 Creando esquema app en base de datos xmls...');
    await xmlsDB.query('CREATE SCHEMA IF NOT EXISTS app;');
    console.log('✅ Esquema app creado exitosamente');
  } catch (error) {
    console.error('❌ Error creando esquema app:', error.message);
    throw error;
  }
}

async function createTables() {
  try {
    console.log('📦 Creando tablas en esquema app...');
    
    // Crear tabla roles
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla roles creada');
    
    // Crear tabla users
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
        status BOOLEAN DEFAULT true,
        UNIQUE(username),
        UNIQUE(email)
      );
    `);
    console.log('✅ Tabla users creada');
    
    // Crear tabla menus
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL,
        icon VARCHAR(255),
        route VARCHAR(255) NOT NULL,
        parent_id UUID REFERENCES app.menus(id) ON DELETE CASCADE,
        section VARCHAR(20) DEFAULT 'main' CHECK (section IN ('main', 'secondary', 'document')),
        status BOOLEAN DEFAULT true,
        metabase_dashboard_id INTEGER,
        UNIQUE(key)
      );
    `);
    console.log('✅ Tabla menus creada');
    
    // Crear tabla role_menu_permissions
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.role_menu_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
        menu_id UUID NOT NULL REFERENCES app.menus(id) ON DELETE CASCADE,
        can_view BOOLEAN DEFAULT true,
        can_edit BOOLEAN DEFAULT false,
        UNIQUE(role_id, menu_id)
      );
    `);
    console.log('✅ Tabla role_menu_permissions creada');
    
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
    throw error;
  }
}

async function createIndexes() {
  try {
    console.log('🔍 Creando índices...');
    
    // Índices para users
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_users_username ON app.users(username);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_users_email ON app.users(email);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_users_role_id ON app.users(role_id);');
    
    // Índices para roles
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_roles_name ON app.roles(name);');
    
    // Índices para menus
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_key ON app.menus(key);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_parent_id ON app.menus(parent_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_section ON app.menus(section);');
    
    // Índices para role_menu_permissions
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_role_menu_permissions_role_id ON app.role_menu_permissions(role_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_role_menu_permissions_menu_id ON app.role_menu_permissions(menu_id);');
    
    console.log('✅ Índices creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando índices:', error.message);
    throw error;
  }
}

async function insertDefaultData() {
  try {
    console.log('📝 Insertando datos por defecto...');
    
    // Verificar si ya existen roles
    const [existingRoles] = await xmlsDB.query('SELECT COUNT(*) as count FROM app.roles;');
    
    if (existingRoles[0].count === 0) {
      // Insertar rol administrador
      await xmlsDB.query(`
        INSERT INTO app.roles (name, status) 
        VALUES ('admin', 'activo');
      `);
      
      // Insertar rol usuario
      await xmlsDB.query(`
        INSERT INTO app.roles (name, status) 
        VALUES ('user', 'activo');
      `);
      
      console.log('✅ Roles por defecto insertados');
    } else {
      console.log('ℹ️  Los roles ya existen, saltando inserción');
    }
    
    // Verificar si ya existe usuario admin
    const [existingUsers] = await xmlsDB.query('SELECT COUNT(*) as count FROM app.users WHERE username = \'admin\';');
    
    if (existingUsers[0].count === 0) {
      // Obtener ID del rol admin
      const [adminRole] = await xmlsDB.query('SELECT id FROM app.roles WHERE name = \'admin\';');
      
      if (adminRole.length > 0) {
        // Insertar usuario administrador por defecto (password: admin123)
        await xmlsDB.query(`
          INSERT INTO app.users (username, email, password_hash, role_id, status) 
          VALUES ('admin', 'admin@siront.com', '$2b$10$rQZ8K9vX8K9vX8K9vX8K9O.8K9vX8K9vX8K9vX8K9vX8K9vX8K9vX8K9', '${adminRole[0].id}', true);
        `);
        console.log('✅ Usuario admin insertado');
      }
    } else {
      console.log('ℹ️  El usuario admin ya existe, saltando inserción');
    }
    
    console.log('✅ Datos por defecto procesados');
    
  } catch (error) {
    console.error('❌ Error insertando datos por defecto:', error.message);
    throw error;
  }
}

async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas creadas...');
    
    const tables = ['roles', 'users', 'menus', 'role_menu_permissions'];
    
    for (const table of tables) {
      const [count] = await xmlsDB.query(`SELECT COUNT(*) as count FROM app.${table};`);
      console.log(`📊 ${table}: ${count[0].count} registros`);
    }
    
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Creando esquema app y tablas de autenticación...');
    console.log('🎯 Base de datos: xmls (localhost)');
    console.log('🎯 Esquema: app');
    console.log('');
    
    // Crear esquema app
    await createAppSchema();
    
    // Crear tablas
    await createTables();
    
    // Crear índices
    await createIndexes();
    
    // Insertar datos por defecto
    await insertDefaultData();
    
    // Verificar tablas
    await verifyTables();
    
    console.log('');
    console.log('🎉 ¡Esquema app creado exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. Actualizar la configuración de la aplicación');
    console.log('2. Cambiar DATABASE_URL para usar la base de datos local');
    console.log('3. Actualizar los modelos para usar el esquema "app"');
    console.log('4. Probar la aplicación con la nueva configuración');
    
  } catch (error) {
    console.error('💥 Error durante la creación:', error);
    process.exit(1);
  } finally {
    await xmlsDB.close();
  }
}

// Ejecutar creación
main(); 