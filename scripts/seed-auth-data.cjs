const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Configuración Oracle para CGBRITO
const oracleConfig = {
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
};

async function seedAuthData() {
  const sequelize = new Sequelize({
    dialect: 'oracle',
    host: oracleConfig.host,
    port: oracleConfig.port,
    database: oracleConfig.database,
    username: oracleConfig.username,
    password: oracleConfig.password,
    logging: false,
    dialectOptions: {
      connectString: `${oracleConfig.host}:${oracleConfig.port}/${oracleConfig.database}`,
      schema: oracleConfig.schema
    }
  });

  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');

    console.log('🌱 Poblando sistema de autenticación...');

    // 1. Insertar roles básicos
    console.log('   👥 Insertando roles...');
    const roles = [
      { name: 'ADMIN', description: 'Administrador del sistema con acceso completo' },
      { name: 'EJECUTIVO', description: 'Ejecutivo del sistema con acceso limitado' },
      { name: 'AUDITOR', description: 'Auditor del sistema con acceso de solo lectura' }
    ];

    for (const role of roles) {
      await sequelize.query(`
        INSERT INTO ${oracleConfig.schema}.ROLES (NAME, DESCRIPTION, IS_ACTIVE)
        VALUES (:name, :description, 1)
      `, {
        replacements: { name: role.name, description: role.description }
      });
      console.log(`   ✅ Rol ${role.name} insertado`);
    }

    // 2. Insertar permisos del sistema
    console.log('   🔐 Insertando permisos...');
    const permissions = [
      // Dashboard
      { name: 'dashboard.access', description: 'Acceso al dashboard', resource: 'dashboard', action: 'access' },
      { name: 'dashboard.metrics', description: 'Ver métricas del dashboard', resource: 'dashboard', action: 'metrics' },
      
      // Usuarios
      { name: 'users.read', description: 'Ver usuarios', resource: 'users', action: 'read' },
      { name: 'users.create', description: 'Crear usuarios', resource: 'users', action: 'create' },
      { name: 'users.update', description: 'Actualizar usuarios', resource: 'users', action: 'update' },
      { name: 'users.delete', description: 'Eliminar usuarios', resource: 'users', action: 'delete' },
      { name: 'users.manage', description: 'Gestión completa de usuarios', resource: 'users', action: 'manage' },
      
      // Roles
      { name: 'roles.read', description: 'Ver roles', resource: 'roles', action: 'read' },
      { name: 'roles.create', description: 'Crear roles', resource: 'roles', action: 'create' },
      { name: 'roles.update', description: 'Actualizar roles', resource: 'roles', action: 'update' },
      { name: 'roles.delete', description: 'Eliminar roles', resource: 'roles', action: 'delete' },
      { name: 'roles.manage', description: 'Gestión completa de roles', resource: 'roles', action: 'manage' },
      
      // Ejecutivos
      { name: 'ejecutivos.read', description: 'Ver ejecutivos', resource: 'ejecutivos', action: 'read' },
      { name: 'ejecutivos.create', description: 'Crear ejecutivos', resource: 'ejecutivos', action: 'create' },
      { name: 'ejecutivos.update', description: 'Actualizar ejecutivos', resource: 'ejecutivos', action: 'update' },
      { name: 'ejecutivos.delete', description: 'Eliminar ejecutivos', resource: 'ejecutivos', action: 'delete' },
      { name: 'ejecutivos.manage', description: 'Gestión completa de ejecutivos', resource: 'ejecutivos', action: 'manage' },
      
      // Cartera
      { name: 'cartera.read', description: 'Ver cartera', resource: 'cartera', action: 'read' },
      { name: 'cartera.manage', description: 'Gestión de cartera', resource: 'cartera', action: 'manage' },
      
      // Reportes
      { name: 'reports.access', description: 'Acceso a reportes', resource: 'reports', action: 'access' },
      { name: 'reports.manage', description: 'Gestión de reportes', resource: 'reports', action: 'manage' },
      
      // Tickets
      { name: 'tickets.read', description: 'Ver tickets', resource: 'tickets', action: 'read' },
      { name: 'tickets.create', description: 'Crear tickets', resource: 'tickets', action: 'create' },
      { name: 'tickets.update', description: 'Actualizar tickets', resource: 'tickets', action: 'update' },
      { name: 'tickets.delete', description: 'Eliminar tickets', resource: 'tickets', action: 'delete' },
      { name: 'tickets.manage', description: 'Gestión completa de tickets', resource: 'tickets', action: 'manage' },
      
      // Sistema
      { name: 'system.config', description: 'Configuración del sistema', resource: 'system', action: 'config' },
      { name: 'system.logs', description: 'Ver logs del sistema', resource: 'system', action: 'logs' },
      { name: 'system.backup', description: 'Backup del sistema', resource: 'system', action: 'backup' },
      
      // Auditoría
      { name: 'audit.read', description: 'Ver logs de auditoría', resource: 'audit', action: 'read' },
      { name: 'audit.export', description: 'Exportar logs de auditoría', resource: 'audit', action: 'export' }
    ];

    for (const permission of permissions) {
      await sequelize.query(`
        INSERT INTO ${oracleConfig.schema}.PERMISSIONS (NAME, DESCRIPTION, RESOURCE_NAME, ACTION_NAME)
        VALUES (:name, :description, :resource, :action)
      `, {
        replacements: { 
          name: permission.name, 
          description: permission.description, 
          resource: permission.resource, 
          action: permission.action 
        }
      });
      console.log(`   ✅ Permiso ${permission.name} insertado`);
    }

    // 3. Asignar permisos a roles
    console.log('   🔗 Asignando permisos a roles...');
    
    // Obtener IDs de roles
    const [adminRole] = await sequelize.query(`
      SELECT ID FROM ${oracleConfig.schema}.ROLES WHERE NAME = 'ADMIN'
    `);
    const [ejecutivoRole] = await sequelize.query(`
      SELECT ID FROM ${oracleConfig.schema}.ROLES WHERE NAME = 'EJECUTIVO'
    `);
    const [auditorRole] = await sequelize.query(`
      SELECT ID FROM ${oracleConfig.schema}.ROLES WHERE NAME = 'AUDITOR'
    `);

    // Obtener todos los permisos
    const [allPermissions] = await sequelize.query(`
      SELECT ID, NAME FROM ${oracleConfig.schema}.PERMISSIONS
    `);

    // ADMIN: todos los permisos
    for (const permission of allPermissions) {
      await sequelize.query(`
        INSERT INTO ${oracleConfig.schema}.ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
        VALUES (:roleId, :permissionId)
      `, {
        replacements: { roleId: adminRole[0].ID, permissionId: permission.ID }
      });
    }
    console.log('   ✅ Permisos asignados a ADMIN');

    // EJECUTIVO: permisos limitados
    const ejecutivoPermissions = [
      'dashboard.access', 'dashboard.metrics',
      'ejecutivos.read', 'ejecutivos.update',
      'cartera.read', 'cartera.manage',
      'reports.access',
      'tickets.read', 'tickets.create', 'tickets.update'
    ];

    for (const permName of ejecutivoPermissions) {
      const permission = allPermissions.find(p => p.NAME === permName);
      if (permission) {
        await sequelize.query(`
          INSERT INTO ${oracleConfig.schema}.ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
          VALUES (:roleId, :permissionId)
        `, {
          replacements: { roleId: ejecutivoRole[0].ID, permissionId: permission.ID }
        });
      }
    }
    console.log('   ✅ Permisos asignados a EJECUTIVO');

    // AUDITOR: permisos de solo lectura
    const auditorPermissions = [
      'dashboard.access', 'dashboard.metrics',
      'ejecutivos.read', 'cartera.read',
      'reports.access', 'tickets.read',
      'audit.read'
    ];

    for (const permName of auditorPermissions) {
      const permission = allPermissions.find(p => p.NAME === permName);
      if (permission) {
        await sequelize.query(`
          INSERT INTO ${oracleConfig.schema}.ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
          VALUES (:roleId, :permissionId)
        `, {
          replacements: { roleId: auditorRole[0].ID, permissionId: permission.ID }
        });
      }
    }
    console.log('   ✅ Permisos asignados a AUDITOR');

    // 4. Crear usuario administrador
    console.log('   👤 Creando usuario administrador...');
    const adminUserId = uuidv4();
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    await sequelize.query(`
      INSERT INTO ${oracleConfig.schema}.USERS (
        ID, USERNAME, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, ROLE_ID, STATUS
      ) VALUES (
        :id, :username, :email, :passwordHash, :firstName, :lastName, :roleId, :status
      )
    `, {
      replacements: {
        id: adminUserId,
        username: 'admin',
        email: 'admin@sistema.com',
        passwordHash: adminPasswordHash,
        firstName: 'Administrador',
        lastName: 'Sistema',
        roleId: adminRole[0].ID,
        status: 'active'
      }
    });
    console.log('   ✅ Usuario administrador creado');

    // 5. Insertar menús básicos
    console.log('   📋 Insertando menús...');
    const menus = [
      { name: 'Dashboard', description: 'Panel principal', icon: 'dashboard', route: '/dashboard', parentId: null, orderIndex: 1 },
      { name: 'Usuarios', description: 'Gestión de usuarios', icon: 'users', route: '/users', parentId: null, orderIndex: 2 },
      { name: 'Roles', description: 'Gestión de roles', icon: 'shield', route: '/roles', parentId: null, orderIndex: 3 },
      { name: 'Ejecutivos', description: 'Gestión de ejecutivos', icon: 'user-tie', route: '/ejecutivos', parentId: null, orderIndex: 4 },
      { name: 'Cartera', description: 'Gestión de cartera', icon: 'briefcase', route: '/cartera', parentId: null, orderIndex: 5 },
      { name: 'Reportes', description: 'Reportes del sistema', icon: 'chart-bar', route: '/reports', parentId: null, orderIndex: 6 },
      { name: 'Tickets', description: 'Sistema de tickets', icon: 'ticket', route: '/tickets', parentId: null, orderIndex: 7 },
      { name: 'Auditoría', description: 'Logs de auditoría', icon: 'clipboard-list', route: '/audit', parentId: null, orderIndex: 8 }
    ];

    for (const menu of menus) {
      await sequelize.query(`
        INSERT INTO ${oracleConfig.schema}.MENUS (NAME, DESCRIPTION, ICON, ROUTE, PARENT_ID, ORDER_INDEX, IS_ACTIVE)
        VALUES (:name, :description, :icon, :route, :parentId, :orderIndex, 1)
      `, {
        replacements: {
          name: menu.name,
          description: menu.description,
          icon: menu.icon,
          route: menu.route,
          parentId: menu.parentId,
          orderIndex: menu.orderIndex
        }
      });
      console.log(`   ✅ Menú ${menu.name} insertado`);
    }

    console.log('✅ Sistema de autenticación poblado completamente');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   Email: admin@sistema.com');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

seedAuthData();

