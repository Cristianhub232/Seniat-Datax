const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

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
    console.log('🔧 Creando esquema app...');
    await xmlsDB.query('CREATE SCHEMA IF NOT EXISTS app;');
    console.log('✅ Esquema app creado');
  } catch (error) {
    console.error('❌ Error creando esquema app:', error.message);
    throw error;
  }
}

async function createTables() {
  try {
    console.log('📦 Creando tablas de autenticación...');
    
    // Crear tabla roles
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla roles creada');
    
    // Crear tabla users
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE RESTRICT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        last_login TIMESTAMP,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla users creada');
    
    // Crear tabla permissions
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        resource VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla permissions creada');
    
    // Crear tabla role_permissions
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES app.permissions(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role_id, permission_id)
      );
    `);
    console.log('✅ Tabla role_permissions creada');
    
    // Crear tabla sessions
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla sessions creada');
    
    // Crear tabla audit_logs
    await xmlsDB.query(`
      CREATE TABLE IF NOT EXISTS app.audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES app.users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100),
        resource_id UUID,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla audit_logs creada');
    
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
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_users_status ON app.users(status);');
    
    // Índices para roles
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_roles_name ON app.roles(name);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_roles_status ON app.roles(status);');
    
    // Índices para permissions
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_permissions_name ON app.permissions(name);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_permissions_resource ON app.permissions(resource);');
    
    // Índices para role_permissions
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_role_permissions_role_id ON app.role_permissions(role_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_role_permissions_permission_id ON app.role_permissions(permission_id);');
    
    // Índices para sessions
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id ON app.sessions(user_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_sessions_token_hash ON app.sessions(token_hash);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_sessions_expires_at ON app.sessions(expires_at);');
    
    // Índices para audit_logs
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_audit_logs_user_id ON app.audit_logs(user_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_audit_logs_action ON app.audit_logs(action);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_audit_logs_created_at ON app.audit_logs(created_at);');
    
    console.log('✅ Índices creados');
    
  } catch (error) {
    console.error('❌ Error creando índices:', error.message);
    throw error;
  }
}

async function insertDefaultData() {
  try {
    console.log('📝 Insertando datos por defecto...');
    
    // Insertar roles básicos
    const [adminRole] = await xmlsDB.query(`
      INSERT INTO app.roles (name, description, status) 
      VALUES ('admin', 'Administrador del sistema con acceso completo', 'active')
      RETURNING id;
    `);
    
    const [userRole] = await xmlsDB.query(`
      INSERT INTO app.roles (name, description, status) 
      VALUES ('user', 'Usuario estándar con acceso limitado', 'active')
      RETURNING id;
    `);
    
    console.log('✅ Roles creados');
    
    // Insertar permisos básicos
    const permissions = [
      { name: 'auth:login', description: 'Permitir inicio de sesión', resource: 'auth', action: 'login' },
      { name: 'auth:logout', description: 'Permitir cierre de sesión', resource: 'auth', action: 'logout' },
      { name: 'users:read', description: 'Leer información de usuarios', resource: 'users', action: 'read' },
      { name: 'users:write', description: 'Crear y modificar usuarios', resource: 'users', action: 'write' },
      { name: 'users:delete', description: 'Eliminar usuarios', resource: 'users', action: 'delete' },
      { name: 'roles:read', description: 'Leer información de roles', resource: 'roles', action: 'read' },
      { name: 'roles:write', description: 'Crear y modificar roles', resource: 'roles', action: 'write' },
      { name: 'system:admin', description: 'Acceso administrativo completo', resource: 'system', action: 'admin' }
    ];
    
    for (const permission of permissions) {
      await xmlsDB.query(`
        INSERT INTO app.permissions (name, description, resource, action) 
        VALUES (?, ?, ?, ?)
      `, {
        replacements: [permission.name, permission.description, permission.resource, permission.action]
      });
    }
    
    console.log('✅ Permisos creados');
    
    // Asignar permisos a roles
    const adminPermissions = ['auth:login', 'auth:logout', 'users:read', 'users:write', 'users:delete', 'roles:read', 'roles:write', 'system:admin'];
    const userPermissions = ['auth:login', 'auth:logout', 'users:read'];
    
    // Asignar permisos al rol admin
    for (const permName of adminPermissions) {
      await xmlsDB.query(`
        INSERT INTO app.role_permissions (role_id, permission_id)
        SELECT ?, id FROM app.permissions WHERE name = ?
      `, {
        replacements: [adminRole[0].id, permName]
      });
    }
    
    // Asignar permisos al rol user
    for (const permName of userPermissions) {
      await xmlsDB.query(`
        INSERT INTO app.role_permissions (role_id, permission_id)
        SELECT ?, id FROM app.permissions WHERE name = ?
      `, {
        replacements: [userRole[0].id, permName]
      });
    }
    
    console.log('✅ Permisos asignados a roles');
    
    // Crear usuario administrador
    const adminPassword = 'admin123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    
    await xmlsDB.query(`
      INSERT INTO app.users (username, email, password_hash, first_name, last_name, role_id, status) 
      VALUES ('admin', 'admin@siront.com', ?, 'Administrador', 'Sistema', ?, 'active')
    `, {
      replacements: [adminPasswordHash, adminRole[0].id]
    });
    
    // Crear usuario de prueba
    const userPassword = 'user123';
    const userPasswordHash = await bcrypt.hash(userPassword, 10);
    
    await xmlsDB.query(`
      INSERT INTO app.users (username, email, password_hash, first_name, last_name, role_id, status) 
      VALUES ('user', 'user@siront.com', ?, 'Usuario', 'Prueba', ?, 'active')
    `, {
      replacements: [userPasswordHash, userRole[0].id]
    });
    
    console.log('✅ Usuarios creados');
    console.log('🔑 Credenciales de prueba:');
    console.log('  - Admin: admin / admin123');
    console.log('  - User: user / user123');
    
  } catch (error) {
    console.error('❌ Error insertando datos por defecto:', error.message);
    throw error;
  }
}

async function verifyTables() {
  try {
    console.log('🔍 Verificando tablas creadas...');
    
    const tables = ['roles', 'users', 'permissions', 'role_permissions', 'sessions', 'audit_logs'];
    
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
    console.log('🚀 Creando esquema de autenticación completo...');
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
    console.log('🎉 ¡Esquema de autenticación creado exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. Actualizar los modelos de Sequelize');
    console.log('2. Implementar controladores de autenticación');
    console.log('3. Crear endpoints de la API');
    console.log('4. Probar el sistema completo');
    
  } catch (error) {
    console.error('💥 Error durante la creación:', error);
    process.exit(1);
  } finally {
    await xmlsDB.close();
  }
}

// Ejecutar creación
main(); 