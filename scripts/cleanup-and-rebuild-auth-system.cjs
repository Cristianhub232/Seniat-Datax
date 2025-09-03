const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

console.log('🧹 Limpiando y reconstruyendo el sistema de autenticación...\n');

async function cleanupAndRebuild() {
  let connection;
  
  try {
    // Conectar a Oracle
    console.log('1️⃣ Conectando a Oracle...');
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });
    console.log('   ✅ Conexión exitosa');

    // Paso 1: Eliminar tablas existentes en orden correcto
    console.log('\n2️⃣ Eliminando tablas existentes...');
    
    const tablesToDrop = [
      'ROLE_PERMISSIONS',
      'USER_ROLES', 
      'PERMISSIONS',
      'ROLES',
      'USERS',
      'SESSIONS'
    ];

    for (const table of tablesToDrop) {
      try {
        await connection.execute(`DROP TABLE CGBRITO.${table} CASCADE CONSTRAINTS`);
        console.log(`   ✅ Tabla ${table} eliminada`);
      } catch (error) {
        if (error.message.includes('ORA-00942')) {
          console.log(`   ℹ️ Tabla ${table} no existía`);
        } else {
          console.log(`   ⚠️ Error eliminando ${table}: ${error.message}`);
        }
      }
    }

    // Paso 2: Crear nuevas tablas con estructura optimizada
    console.log('\n3️⃣ Creando nuevas tablas...');
    
    // Tabla de usuarios simplificada
    await connection.execute(`
      CREATE TABLE CGBRITO.USERS (
        ID VARCHAR2(36) PRIMARY KEY,
        USERNAME VARCHAR2(50) UNIQUE NOT NULL,
        EMAIL VARCHAR2(100) UNIQUE NOT NULL,
        PASSWORD_HASH VARCHAR2(255) NOT NULL,
        FIRST_NAME VARCHAR2(100),
        LAST_NAME VARCHAR2(100),
        ROLE VARCHAR2(20) NOT NULL CHECK (ROLE IN ('ADMIN', 'EJECUTIVO')),
        STATUS VARCHAR2(20) DEFAULT 'active' CHECK (STATUS IN ('active', 'inactive', 'locked')),
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        LAST_LOGIN TIMESTAMP,
        LOGIN_ATTEMPTS NUMBER DEFAULT 0,
        LOCKED_UNTIL TIMESTAMP
      )
    `);
    console.log('   ✅ Tabla USERS creada');

    // Tabla de permisos simplificada
    await connection.execute(`
      CREATE TABLE CGBRITO.PERMISSIONS (
        ID VARCHAR2(36) PRIMARY KEY,
        NAME VARCHAR2(100) UNIQUE NOT NULL,
        DESCRIPTION VARCHAR2(255),
        RESOURCE VARCHAR2(50) NOT NULL,
        ACTION VARCHAR2(50) NOT NULL,
        IS_ACTIVE NUMBER(1) DEFAULT 1,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Tabla PERMISSIONS creada');

    // Tabla de roles con permisos integrados
    await connection.execute(`
      CREATE TABLE CGBRITO.ROLES (
        ID VARCHAR2(36) PRIMARY KEY,
        NAME VARCHAR2(50) UNIQUE NOT NULL,
        DESCRIPTION VARCHAR2(255),
        PERMISSIONS CLOB, -- JSON string de permisos
        IS_ACTIVE NUMBER(1) DEFAULT 1,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Tabla ROLES creada');

    // Tabla de sesiones simplificada
    await connection.execute(`
      CREATE TABLE CGBRITO.SESSIONS (
        ID VARCHAR2(36) PRIMARY KEY,
        USER_ID VARCHAR2(36) NOT NULL,
        TOKEN_HASH VARCHAR2(255) UNIQUE NOT NULL,
        EXPIRES_AT TIMESTAMP NOT NULL,
        IP_ADDRESS VARCHAR2(45),
        USER_AGENT VARCHAR2(500),
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (USER_ID) REFERENCES CGBRITO.USERS(ID) ON DELETE CASCADE
      )
    `);
    console.log('   ✅ Tabla SESSIONS creada');

    // Crear índices para mejor rendimiento
    console.log('\n4️⃣ Creando índices...');
    
    await connection.execute('CREATE INDEX CGBRITO.IDX_USERS_USERNAME ON CGBRITO.USERS(USERNAME)');
    await connection.execute('CREATE INDEX CGBRITO.IDX_USERS_EMAIL ON CGBRITO.USERS(EMAIL)');
    await connection.execute('CREATE INDEX CGBRITO.IDX_USERS_ROLE ON CGBRITO.USERS(ROLE)');
    await connection.execute('CREATE INDEX CGBRITO.IDX_SESSIONS_TOKEN ON CGBRITO.SESSIONS(TOKEN_HASH)');
    await connection.execute('CREATE INDEX CGBRITO.IDX_SESSIONS_USER ON CGBRITO.SESSIONS(USER_ID)');
    await connection.execute('CREATE INDEX CGBRITO.IDX_PERMISSIONS_RESOURCE_ACTION ON CGBRITO.PERMISSIONS(RESOURCE, ACTION)');
    
    console.log('   ✅ Índices creados');

    // Paso 3: Insertar datos base
    console.log('\n5️⃣ Insertando datos base...');
    
    // Insertar permisos del sistema
    const permissions = [
      // Dashboard
      { id: 'perm-dashboard-access', name: 'dashboard.access', description: 'Acceso al dashboard', resource: 'dashboard', action: 'access' },
      { id: 'perm-dashboard-metrics', name: 'dashboard.metrics', description: 'Ver métricas del dashboard', resource: 'dashboard', action: 'metrics' },
      
      // Usuarios
      { id: 'perm-users-read', name: 'users.read', description: 'Ver usuarios', resource: 'users', action: 'read' },
      { id: 'perm-users-create', name: 'users.create', description: 'Crear usuarios', resource: 'users', action: 'create' },
      { id: 'perm-users-update', name: 'users.update', description: 'Actualizar usuarios', resource: 'users', action: 'update' },
      { id: 'perm-users-delete', name: 'users.delete', description: 'Eliminar usuarios', resource: 'users', action: 'delete' },
      { id: 'perm-users-manage', name: 'users.manage', description: 'Gestión completa de usuarios', resource: 'users', action: 'manage' },
      
      // Roles
      { id: 'perm-roles-read', name: 'roles.read', description: 'Ver roles', resource: 'roles', action: 'read' },
      { id: 'perm-roles-create', name: 'roles.create', description: 'Crear roles', resource: 'roles', action: 'create' },
      { id: 'perm-roles-update', name: 'roles.update', description: 'Actualizar roles', resource: 'roles', action: 'update' },
      { id: 'perm-roles-delete', name: 'roles.delete', description: 'Eliminar roles', resource: 'roles', action: 'delete' },
      { id: 'perm-roles-manage', name: 'roles.manage', description: 'Gestión completa de roles', resource: 'roles', action: 'manage' },
      
      // Ejecutivos
      { id: 'perm-ejecutivos-read', name: 'ejecutivos.read', description: 'Ver ejecutivos', resource: 'ejecutivos', action: 'read' },
      { id: 'perm-ejecutivos-create', name: 'ejecutivos.create', description: 'Crear ejecutivos', resource: 'ejecutivos', action: 'create' },
      { id: 'perm-ejecutivos-update', name: 'ejecutivos.update', description: 'Actualizar ejecutivos', resource: 'ejecutivos', action: 'update' },
      { id: 'perm-ejecutivos-delete', name: 'ejecutivos.delete', description: 'Eliminar ejecutivos', resource: 'ejecutivos', action: 'delete' },
      { id: 'perm-ejecutivos-manage', name: 'ejecutivos.manage', description: 'Gestión completa de ejecutivos', resource: 'ejecutivos', action: 'manage' },
      
      // Cartera
      { id: 'perm-cartera-read', name: 'cartera.read', description: 'Ver cartera', resource: 'cartera', action: 'read' },
      { id: 'perm-cartera-manage', name: 'cartera.manage', description: 'Gestión completa de cartera', resource: 'cartera', action: 'manage' },
      
      // Pagos
      { id: 'perm-pagos-read', name: 'pagos.read', description: 'Ver pagos', resource: 'pagos', action: 'read' },
      { id: 'perm-pagos-manage', name: 'pagos.manage', description: 'Gestión completa de pagos', resource: 'pagos', action: 'manage' },
      
      // Tickets
      { id: 'perm-tickets-read', name: 'tickets.read', description: 'Ver tickets', resource: 'tickets', action: 'read' },
      { id: 'perm-tickets-manage', name: 'tickets.manage', description: 'Gestión completa de tickets', resource: 'tickets', action: 'manage' },
      
      // Reportes
      { id: 'perm-reports-access', name: 'reports.access', description: 'Acceso a reportes', resource: 'reports', action: 'access' },
      { id: 'perm-reports-manage', name: 'reports.manage', description: 'Gestión de reportes', resource: 'reports', action: 'manage' },
      
      // Sistema
      { id: 'perm-system-config', name: 'system.config', description: 'Configuración del sistema', resource: 'system', action: 'config' },
      { id: 'perm-system-logs', name: 'system.logs', description: 'Ver logs del sistema', resource: 'system', action: 'logs' }
    ];

    for (const perm of permissions) {
      await connection.execute(`
        INSERT INTO CGBRITO.PERMISSIONS (ID, NAME, DESCRIPTION, RESOURCE, ACTION)
        VALUES (:id, :name, :description, :resource, :action)
      `, perm);
    }
    console.log(`   ✅ ${permissions.length} permisos insertados`);

    // Insertar roles predefinidos
    const adminPermissions = JSON.stringify(permissions.map(p => p.name));
    const ejecutivoPermissions = JSON.stringify([
      'dashboard.access', 'dashboard.metrics', 'ejecutivos.read', 'ejecutivos.update',
      'cartera.read', 'pagos.read', 'tickets.read', 'reports.access'
    ]);

    await connection.execute(`
      INSERT INTO CGBRITO.ROLES (ID, NAME, DESCRIPTION, PERMISSIONS)
      VALUES ('role-admin', 'ADMIN', 'Administrador del sistema con acceso completo', :permissions)
    `, { permissions: adminPermissions });

    await connection.execute(`
      INSERT INTO CGBRITO.ROLES (ID, NAME, DESCRIPTION, PERMISSIONS)
      VALUES ('role-ejecutivo', 'EJECUTIVO', 'Ejecutivo con acceso limitado', :permissions)
    `, { permissions: ejecutivoPermissions });

    console.log('   ✅ Roles predefinidos insertados');

    // Insertar usuario admin
    const bcrypt = require('bcrypt');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    await connection.execute(`
      INSERT INTO CGBRITO.USERS (ID, USERNAME, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, ROLE)
      VALUES ('user-admin', 'admin', 'admin@seniat.gob.ve', :password, 'CRISTIAN GIOVANNI', 'BRITO ARELLANO', 'ADMIN')
    `, { password: adminPasswordHash });

    console.log('   ✅ Usuario admin creado');

    // Commit de todos los cambios
    await connection.commit();
    console.log('\n✅ Sistema de autenticación reconstruido exitosamente!');

    console.log('\n📊 Resumen de la reconstrucción:');
    console.log('   - Tablas eliminadas y recreadas');
    console.log('   - Estructura optimizada y simplificada');
    console.log('   - Permisos predefinidos: 26');
    console.log('   - Roles: ADMIN y EJECUTIVO');
    console.log('   - Usuario admin: admin/admin123');
    console.log('   - Índices para mejor rendimiento');

  } catch (error) {
    console.error('❌ Error durante la reconstrucción:', error);
    if (connection) {
      await connection.rollback();
    }
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la reconstrucción
cleanupAndRebuild();
