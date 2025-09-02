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

async function checkPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar tabla PERMISSIONS
    console.log('\n📋 Verificando tabla PERMISSIONS...');
    const permissions = await sequelize.query('SELECT * FROM CGBRITO.PERMISSIONS ORDER BY ID');
    console.log(`Total de permisos: ${permissions[0].length}`);
    
    if (permissions[0].length > 0) {
      console.log('\nPrimeros 5 permisos:');
      permissions[0].slice(0, 5).forEach(p => {
        console.log(`  - ID: ${p.ID}, Nombre: ${p.NAME}, Recurso: ${p.RESOURCE_NAME || 'N/A'}, Acción: ${p.ACTION_NAME || 'N/A'}`);
      });
    }
    
    // Verificar tabla ROLE_PERMISSIONS
    console.log('\n🔗 Verificando tabla ROLE_PERMISSIONS...');
    const rolePermissions = await sequelize.query('SELECT * FROM CGBRITO.ROLE_PERMISSIONS ORDER BY ROLE_ID');
    console.log(`Total de role_permissions: ${rolePermissions[0].length}`);
    
    if (rolePermissions[0].length > 0) {
      console.log('\nPrimeros 5 role_permissions:');
      rolePermissions[0].slice(0, 5).forEach(rp => {
        console.log(`  - Role ID: ${rp.ROLE_ID}, Permission ID: ${rp.PERMISSION_ID}`);
      });
    }
    
    // Verificar tabla ROLES
    console.log('\n👥 Verificando tabla ROLES...');
    const roles = await sequelize.query('SELECT * FROM CGBRITO.ROLES ORDER BY ID');
    console.log(`Total de roles: ${roles[0].length}`);
    
    if (roles[0].length > 0) {
      console.log('\nRoles disponibles:');
      roles[0].forEach(r => {
        console.log(`  - ID: ${r.ID}, Nombre: ${r.NAME}, Descripción: ${r.DESCRIPTION || 'N/A'}`);
      });
    }
    
    // Verificar permisos por rol
    console.log('\n🔐 Verificando permisos por rol...');
    const permissionsByRole = await sequelize.query(`
      SELECT 
        r.NAME as role_name,
        p.NAME as permission_name,
        p.RESOURCE_NAME,
        p.ACTION_NAME
      FROM CGBRITO.ROLES r
      LEFT JOIN CGBRITO.ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
      LEFT JOIN CGBRITO.PERMISSIONS p ON rp.PERMISSION_ID = p.ID
      ORDER BY r.NAME, p.NAME
    `);
    
    console.log(`Total de relaciones encontradas: ${permissionsByRole[0].length}`);
    
    if (permissionsByRole[0].length > 0) {
      console.log('\nPermisos por rol:');
      let currentRole = '';
      permissionsByRole[0].forEach(item => {
        if (item.ROLE_NAME !== currentRole) {
          currentRole = item.ROLE_NAME;
          console.log(`\n  🎭 ${currentRole}:`);
        }
        if (item.PERMISSION_NAME) {
          console.log(`    - ${item.PERMISSION_NAME} (${item.RESOURCE_NAME || 'N/A'} - ${item.ACTION_NAME || 'N/A'})`);
        } else {
          console.log(`    - Sin permisos asignados`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPermissions();
