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

// Permisos básicos que necesitamos agregar
const missingPermissions = [
  { name: 'dashboard.access', description: 'Acceso al dashboard principal', resource: 'dashboard', action: 'access' },
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

async function addMissingPermissions() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    console.log('\n📋 Agregando permisos faltantes...');
    let addedCount = 0;
    
    for (const permission of missingPermissions) {
      try {
        // Verificar si ya existe
        const existing = await sequelize.query(
          'SELECT ID FROM CGBRITO.PERMISSIONS WHERE NAME = :name',
          {
            replacements: { name: permission.name },
            type: 'SELECT'
          }
        );
        
        if (existing[0].length === 0) {
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
    
    // Verificar permisos del rol ADMIN
    console.log('\n🔍 Verificando permisos del rol ADMIN...');
    const adminPermissions = await sequelize.query(`
      SELECT p.NAME, p.DESCRIPTION
      FROM CGBRITO.ROLES r
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
      JOIN CGBRITO.PERMISSIONS p ON rp.PERMISSION_ID = p.ID
      WHERE r.NAME = 'ADMIN'
      ORDER BY p.NAME
    `, { type: 'SELECT' });
    
    console.log(`\n🎭 Permisos del rol ADMIN (${adminPermissions[0].length}):`);
    adminPermissions[0].forEach(p => {
      console.log(`  - ${p.NAME}: ${p.DESCRIPTION}`);
    });
    
    console.log('\n🎉 Permisos agregados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

addMissingPermissions();
