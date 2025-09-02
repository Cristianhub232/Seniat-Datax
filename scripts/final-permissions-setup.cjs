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

// Permisos que necesitamos agregar
const newPermissions = [
  { name: 'dashboard.metrics', description: 'Ver métricas del dashboard', resource: 'dashboard', action: 'metrics' },
  { name: 'users.manage', description: 'Gestión completa de usuarios', resource: 'users', action: 'manage' },
  { name: 'roles.manage', description: 'Gestión completa de roles', resource: 'roles', action: 'manage' },
  { name: 'ejecutivos.manage', description: 'Gestión completa de ejecutivos', resource: 'ejecutivos', action: 'manage' },
  { name: 'tickets.manage', description: 'Gestión completa de tickets', resource: 'tickets', action: 'manage' },
  { name: 'cartera.manage', description: 'Gestión completa de cartera', resource: 'cartera', action: 'manage' },
  { name: 'pagos.manage', description: 'Gestión completa de pagos', resource: 'pagos', action: 'manage' },
  { name: 'reports.manage', description: 'Gestión completa de reportes', resource: 'reports', action: 'manage' },
  { name: 'system.config', description: 'Configurar sistema', resource: 'system', action: 'config' },
  { name: 'system.backup', description: 'Realizar respaldos', resource: 'system', action: 'backup' },
  { name: 'system.logs', description: 'Ver logs del sistema', resource: 'system', action: 'logs' },
  { name: 'audit.export', description: 'Exportar logs de auditoría', resource: 'audit', action: 'export' }
];

async function setupPermissions() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Agregar permisos faltantes
    console.log('\n📋 Agregando permisos faltantes...');
    let addedCount = 0;
    
    for (const permission of newPermissions) {
      try {
        // Verificar si ya existe
        const existing = await sequelize.query(
          'SELECT ID FROM CGBRITO.PERMISSIONS WHERE NAME = :name',
          {
            replacements: { name: permission.name },
            type: 'SELECT'
          }
        );
        
        // La respuesta de Sequelize es diferente, necesitamos verificar correctamente
        if (!existing || !existing[0] || existing[0].length === 0) {
          // Crear nuevo permiso
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
          
          console.log(`  ✅ Agregado: ${permission.name}`);
          addedCount++;
        } else {
          console.log(`  ⚠️ Ya existe: ${permission.name}`);
        }
      } catch (error) {
        console.log(`  ❌ Error con ${permission.name}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Total de permisos agregados: ${addedCount}`);
    
    // 2. Verificar estado actual
    console.log('\n🔍 Verificando estado actual...');
    
    // Contar permisos totales
    const totalPermissions = await sequelize.query('SELECT COUNT(*) as total FROM CGBRITO.PERMISSIONS', { type: 'SELECT' });
    console.log(`📊 Total de permisos en la base de datos: ${totalPermissions[0][0].TOTAL}`);
    
    // Contar roles
    const totalRoles = await sequelize.query('SELECT COUNT(*) as total FROM CGBRITO.ROLES', { type: 'SELECT' });
    console.log(`👥 Total de roles en la base de datos: ${totalRoles[0][0].TOTAL}`);
    
    // 3. Mostrar roles disponibles
    console.log('\n🎭 Roles disponibles:');
    const roles = await sequelize.query('SELECT ID, NAME, DESCRIPTION FROM CGBRITO.ROLES ORDER BY ID', { type: 'SELECT' });
    roles[0].forEach(role => {
      console.log(`  - ID: ${role.ID}, Nombre: ${role.NAME}, Descripción: ${role.DESCRIPTION || 'N/A'}`);
    });
    
    // 4. Mostrar permisos disponibles
    console.log('\n🔐 Permisos disponibles:');
    const permissions = await sequelize.query('SELECT ID, NAME, RESOURCE_NAME, ACTION_NAME FROM CGBRITO.PERMISSIONS ORDER BY NAME', { type: 'SELECT' });
    permissions[0].forEach(permission => {
      console.log(`  - ${permission.NAME} (${permission.RESOURCE_NAME || 'N/A'} - ${permission.ACTION_NAME || 'N/A'})`);
    });
    
    // 5. Verificar asignaciones actuales
    console.log('\n🔗 Verificando asignaciones actuales...');
    const assignments = await sequelize.query(`
      SELECT 
        r.NAME as role_name,
        COUNT(rp.PERMISSION_ID) as permission_count
      FROM CGBRITO.ROLES r
      LEFT JOIN CGBRITO.ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
      GROUP BY r.NAME, r.ID
      ORDER BY r.NAME
    `, { type: 'SELECT' });
    
    console.log('\n📊 Permisos por rol:');
    assignments[0].forEach(assignment => {
      console.log(`  🎭 ${assignment.ROLE_NAME}: ${assignment.PERMISSION_COUNT} permisos`);
    });
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

setupPermissions();
