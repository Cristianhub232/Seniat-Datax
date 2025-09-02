const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'oracle',
  host: '172.16.32.73',
  port: 1521,
  database: 'DWREPO',
  username: 'CGBRITO',
  password: 'cgkbrito',
  logging: false
});

// Definir permisos estándar para cada módulo
const standardPermissions = [
  // Dashboard
  { name: 'dashboard.access', description: 'Acceso al dashboard principal', resource: 'dashboard', action: 'access' },
  { name: 'dashboard.metrics', description: 'Ver métricas del dashboard', resource: 'dashboard', action: 'metrics' },
  
  // Usuarios
  { name: 'users.read', description: 'Ver usuarios del sistema', resource: 'users', action: 'read' },
  { name: 'users.create', description: 'Crear nuevos usuarios', resource: 'users', action: 'create' },
  { name: 'users.update', description: 'Modificar usuarios existentes', resource: 'users', action: 'update' },
  { name: 'users.delete', description: 'Eliminar usuarios', resource: 'users', action: 'delete' },
  { name: 'users.manage', description: 'Gestión completa de usuarios', resource: 'users', action: 'manage' },
  
  // Roles
  { name: 'roles.read', description: 'Ver roles del sistema', resource: 'roles', action: 'read' },
  { name: 'roles.create', description: 'Crear nuevos roles', resource: 'roles', action: 'create' },
  { name: 'roles.update', description: 'Modificar roles existentes', resource: 'roles', action: 'update' },
  { name: 'roles.delete', description: 'Eliminar roles', resource: 'roles', action: 'delete' },
  { name: 'roles.manage', description: 'Gestión completa de roles', resource: 'roles', action: 'manage' },
  
  // Ejecutivos
  { name: 'ejecutivos.read', description: 'Ver ejecutivos', resource: 'ejecutivos', action: 'read' },
  { name: 'ejecutivos.create', description: 'Crear ejecutivos', resource: 'ejecutivos', action: 'create' },
  { name: 'ejecutivos.update', description: 'Modificar ejecutivos', resource: 'ejecutivos', action: 'update' },
  { name: 'ejecutivos.delete', description: 'Eliminar ejecutivos', resource: 'ejecutivos', action: 'delete' },
  { name: 'ejecutivos.manage', description: 'Gestión completa de ejecutivos', resource: 'ejecutivos', action: 'manage' },
  
  // Tickets
  { name: 'tickets.read', description: 'Ver tickets', resource: 'tickets', action: 'read' },
  { name: 'tickets.create', description: 'Crear tickets', resource: 'tickets', action: 'create' },
  { name: 'tickets.update', description: 'Modificar tickets', resource: 'tickets', action: 'update' },
  { name: 'tickets.delete', description: 'Eliminar tickets', resource: 'tickets', action: 'delete' },
  { name: 'tickets.manage', description: 'Gestión completa de tickets', resource: 'tickets', action: 'manage' },
  
  // Cartera de Contribuyentes
  { name: 'cartera.read', description: 'Ver cartera de contribuyentes', resource: 'cartera', action: 'read' },
  { name: 'cartera.create', description: 'Crear registros de cartera', resource: 'cartera', action: 'create' },
  { name: 'cartera.update', description: 'Modificar cartera', resource: 'cartera', action: 'update' },
  { name: 'cartera.delete', description: 'Eliminar registros de cartera', resource: 'cartera', action: 'delete' },
  { name: 'cartera.manage', description: 'Gestión completa de cartera', resource: 'cartera', action: 'manage' },
  
  // Pagos Ejecutados
  { name: 'pagos.read', description: 'Ver pagos ejecutados', resource: 'pagos', action: 'read' },
  { name: 'pagos.create', description: 'Registrar pagos', resource: 'pagos', action: 'create' },
  { name: 'pagos.update', description: 'Modificar pagos', resource: 'pagos', action: 'update' },
  { name: 'pagos.delete', description: 'Eliminar pagos', resource: 'pagos', action: 'delete' },
  { name: 'pagos.manage', description: 'Gestión completa de pagos', resource: 'pagos', action: 'manage' },
  
  // Reportes
  { name: 'reports.read', description: 'Ver reportes', resource: 'reports', action: 'read' },
  { name: 'reports.create', description: 'Crear reportes', resource: 'reports', action: 'create' },
  { name: 'reports.export', description: 'Exportar reportes', resource: 'reports', action: 'export' },
  { name: 'reports.manage', description: 'Gestión completa de reportes', resource: 'reports', action: 'manage' },
  
  // Configuración del Sistema
  { name: 'system.config', description: 'Configurar sistema', resource: 'system', action: 'config' },
  { name: 'system.backup', description: 'Realizar respaldos', resource: 'system', action: 'backup' },
  { name: 'system.logs', description: 'Ver logs del sistema', resource: 'system', action: 'logs' },
  
  // Auditoría
  { name: 'audit.read', description: 'Ver logs de auditoría', resource: 'audit', action: 'read' },
  { name: 'audit.export', description: 'Exportar logs de auditoría', resource: 'audit', action: 'export' }
];

// Definir permisos por rol
const rolePermissions = {
  'ADMIN': [
    // Dashboard completo
    'dashboard.access', 'dashboard.metrics',
    // Gestión completa de usuarios
    'users.manage', 'users.read', 'users.create', 'users.update', 'users.delete',
    // Gestión completa de roles
    'roles.manage', 'roles.read', 'roles.create', 'roles.update', 'roles.delete',
    // Gestión completa de ejecutivos
    'ejecutivos.manage', 'ejecutivos.read', 'ejecutivos.create', 'ejecutivos.update', 'ejecutivos.delete',
    // Gestión completa de tickets
    'tickets.manage', 'tickets.read', 'tickets.create', 'tickets.update', 'tickets.delete',
    // Gestión completa de cartera
    'cartera.manage', 'cartera.read', 'cartera.create', 'cartera.update', 'cartera.delete',
    // Gestión completa de pagos
    'pagos.manage', 'pagos.read', 'pagos.create', 'pagos.update', 'pagos.delete',
    // Reportes completos
    'reports.manage', 'reports.read', 'reports.create', 'reports.export',
    // Sistema completo
    'system.config', 'system.backup', 'system.logs',
    // Auditoría completa
    'audit.read', 'audit.export'
  ],
  
  'Auditor Jefe': [
    // Dashboard limitado
    'dashboard.access',
    // Solo lectura de usuarios
    'users.read',
    // Solo lectura de roles
    'roles.read',
    // Gestión de ejecutivos
    'ejecutivos.manage', 'ejecutivos.read', 'ejecutivos.create', 'ejecutivos.update', 'ejecutivos.delete',
    // Solo lectura de tickets
    'tickets.read',
    // Solo lectura de cartera
    'cartera.read',
    // Solo lectura de pagos
    'pagos.read',
    // Reportes limitados
    'reports.read', 'reports.export',
    // Auditoría completa
    'audit.read', 'audit.export'
  ],
  
  'Ejecutivo': [
    // Dashboard básico
    'dashboard.access',
    // Solo lectura de usuarios (para ver equipo)
    'users.read',
    // Solo lectura de roles
    'roles.read',
    // Solo lectura de ejecutivos
    'ejecutivos.read',
    // Gestión de tickets asignados
    'tickets.read', 'tickets.create', 'tickets.update',
    // Solo lectura de cartera
    'cartera.read',
    // Solo lectura de pagos
    'pagos.read',
    // Reportes básicos
    'reports.read'
  ]
};

async function standardizePermissions() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Limpiar permisos existentes
    console.log('\n🧹 Limpiando permisos existentes...');
    await sequelize.query('DELETE FROM CGBRITO.ROLE_PERMISSIONS');
    await sequelize.query('DELETE FROM CGBRITO.PERMISSIONS');
    console.log('✅ Permisos anteriores eliminados');
    
    // 2. Crear nuevos permisos estándar
    console.log('\n📋 Creando permisos estándar...');
    for (const permission of standardPermissions) {
      await sequelize.query(`
        INSERT INTO CGBRITO.PERMISSIONS (NAME, DESCRIPTION, RESOURCE_NAME, ACTION_NAME, IS_ACTIVE, CREATED_AT, UPDATED_AT)
        VALUES (:name, :description, :resource, :action, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        replacements: {
          name: permission.name,
          description: permission.description,
          resource: permission.resource,
          action: permission.action
        },
        type: 'INSERT'
      });
    }
    console.log(`✅ ${standardPermissions.length} permisos creados`);
    
    // 3. Obtener IDs de permisos y roles
    console.log('\n🔍 Obteniendo IDs de permisos y roles...');
    const permissionsResult = await sequelize.query('SELECT ID, NAME FROM CGBRITO.PERMISSIONS', { type: 'SELECT' });
    const rolesResult = await sequelize.query('SELECT ID, NAME FROM CGBRITO.ROLES', { type: 'SELECT' });
    
    const permissions = permissionsResult[0];
    const roles = rolesResult[0];
    
    // Crear mapeo de nombres a IDs
    const permissionMap = {};
    const roleMap = {};
    
    permissions.forEach(p => {
      permissionMap[p.NAME] = p.ID; // NAME -> ID
    });
    
    roles.forEach(r => {
      roleMap[r.NAME] = r.ID; // NAME -> ID
    });
    
    console.log('✅ Mapeos creados');
    
    // 4. Asignar permisos a roles
    console.log('\n🔗 Asignando permisos a roles...');
    let totalAssignments = 0;
    
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const roleId = roleMap[roleName];
      if (!roleId) {
        console.log(`⚠️ Rol ${roleName} no encontrado, saltando...`);
        continue;
      }
      
      console.log(`\n🎭 Asignando permisos a ${roleName}...`);
      
      for (const permissionName of permissionNames) {
        const permissionId = permissionMap[permissionName];
        if (!permissionId) {
          console.log(`⚠️ Permiso ${permissionName} no encontrado, saltando...`);
          continue;
        }
        
        try {
          await sequelize.query(`
            INSERT INTO CGBRITO.ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID, CREATED_AT)
            VALUES (:roleId, :permissionId, CURRENT_TIMESTAMP)
          `, {
            replacements: { roleId, permissionId },
            type: 'INSERT'
          });
          
          console.log(`  ✅ ${permissionName}`);
          totalAssignments++;
        } catch (error) {
          if (error.message.includes('ORA-00001')) {
            console.log(`  ⚠️ ${permissionName} ya asignado`);
          } else {
            console.log(`  ❌ Error asignando ${permissionName}: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`\n✅ Total de asignaciones: ${totalAssignments}`);
    
    // 5. Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    const finalCheck = await sequelize.query(`
      SELECT 
        r.NAME as role_name,
        COUNT(rp.PERMISSION_ID) as permission_count
      FROM CGBRITO.ROLES r
      LEFT JOIN CGBRITO.ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
      GROUP BY r.NAME, r.ID
      ORDER BY r.NAME
    `, { type: 'SELECT' });
    
    console.log('\n📊 Resumen final:');
    finalCheck[0].forEach(row => {
      console.log(`  🎭 ${row.ROLE_NAME}: ${row.PERMISSION_COUNT} permisos`);
    });
    
    console.log('\n🎉 Sistema de permisos estandarizado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

standardizePermissions();
