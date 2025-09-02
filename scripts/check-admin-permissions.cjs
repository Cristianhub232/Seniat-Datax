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

async function checkAdminPermissions() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar usuario admin
    console.log('\n1️⃣ Verificando usuario admin...');
    const adminUser = await sequelize.query(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, u.ROLE_ID, u.STATUS,
             r.NAME as ROLE_NAME, r.DESCRIPTION as ROLE_DESCRIPTION
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = 'admin'
    `, { type: 'SELECT' });
    
    console.log('📊 Resultado de la consulta:', adminUser);
    
    if (!adminUser || !adminUser[0] || adminUser[0].length === 0) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    const admin = adminUser[0];
    console.log('✅ Usuario admin encontrado:');
    console.log(`   ID: ${admin.ID}`);
    console.log(`   Username: ${admin.USERNAME}`);
    console.log(`   Role ID: ${admin.ROLE_ID}`);
    console.log(`   Role Name: ${admin.ROLE_NAME}`);
    console.log(`   Status: ${admin.STATUS}`);
    
    // 2. Verificar permisos del rol ADMIN
    console.log('\n2️⃣ Verificando permisos del rol ADMIN...');
    const rolePermissions = await sequelize.query(`
      SELECT p.ID, p.NAME, p.DESCRIPTION, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
      ORDER BY p.NAME
    `, {
      replacements: { roleId: admin.ROLE_ID },
      type: 'SELECT'
    });
    
    console.log(`📊 Permisos encontrados: ${rolePermissions.length}`);
    
    if (rolePermissions.length > 0) {
      console.log('\n🔐 Permisos del rol ADMIN:');
      rolePermissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.NAME} (${perm.RESOURCE_NAME || 'N/A'} - ${perm.ACTION_NAME || 'N/A'})`);
      });
    } else {
      console.log('⚠️ No se encontraron permisos para el rol ADMIN');
    }
    
    // 3. Verificar si hay permisos en la tabla PERMISSIONS
    console.log('\n3️⃣ Verificando tabla PERMISSIONS...');
    const allPermissions = await sequelize.query(`
      SELECT COUNT(*) as total FROM CGBRITO.PERMISSIONS
    `, { type: 'SELECT' });
    
    console.log(`📋 Total de permisos en la base de datos: ${allPermissions[0].TOTAL}`);
    
    // 4. Verificar si hay relaciones en ROLE_PERMISSIONS
    console.log('\n4️⃣ Verificando tabla ROLE_PERMISSIONS...');
    const rolePermCount = await sequelize.query(`
      SELECT COUNT(*) as total FROM CGBRITO.ROLE_PERMISSIONS WHERE ROLE_ID = :roleId
    `, {
      replacements: { roleId: admin.ROLE_ID },
      type: 'SELECT'
    });
    
    console.log(`🔗 Relaciones ROLE_PERMISSIONS para ADMIN: ${rolePermCount[0].TOTAL}`);
    
    // 5. Si no hay permisos, asignar todos los permisos disponibles
    if (rolePermissions.length === 0) {
      console.log('\n5️⃣ Asignando todos los permisos al rol ADMIN...');
      
      // Obtener todos los permisos disponibles
      const availablePermissions = await sequelize.query(`
        SELECT ID FROM CGBRITO.PERMISSIONS
      `, { type: 'SELECT' });
      
      if (availablePermissions.length > 0) {
        console.log(`📋 Asignando ${availablePermissions.length} permisos...`);
        
        let assignedCount = 0;
        for (const perm of availablePermissions) {
          try {
            await sequelize.query(`
              INSERT INTO CGBRITO.ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID, CREATED_AT)
              VALUES (:roleId, :permissionId, CURRENT_TIMESTAMP)
            `, {
              replacements: { 
                roleId: admin.ROLE_ID, 
                permissionId: perm.ID 
              },
              type: 'INSERT'
            });
            
            console.log(`  ✅ Asignado permiso ID: ${perm.ID}`);
            assignedCount++;
          } catch (error) {
            if (error.message.includes('ORA-00001')) {
              console.log(`  ⚠️ Permiso ID ${perm.ID} ya asignado`);
            } else {
              console.log(`  ❌ Error asignando permiso ID ${perm.ID}: ${error.message}`);
            }
          }
        }
        
        console.log(`\n✅ Total de permisos asignados: ${assignedCount}`);
        
        // 6. Verificar permisos después de la asignación
        console.log('\n6️⃣ Verificando permisos después de la asignación...');
        const newRolePermissions = await sequelize.query(`
          SELECT p.NAME, p.DESCRIPTION, p.RESOURCE_NAME, p.ACTION_NAME
          FROM CGBRITO.PERMISSIONS p
          JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
          WHERE rp.ROLE_ID = :roleId
          ORDER BY p.NAME
        `, {
          replacements: { roleId: admin.ROLE_ID },
          type: 'SELECT'
        });
        
        console.log(`📊 Permisos después de la asignación: ${newRolePermissions.length}`);
        
        if (newRolePermissions.length > 0) {
          console.log('\n🔐 Permisos del rol ADMIN (actualizados):');
          newRolePermissions.forEach((perm, index) => {
            console.log(`   ${index + 1}. ${perm.NAME} (${perm.RESOURCE_NAME || 'N/A'} - ${perm.ACTION_NAME || 'N/A'})`);
          });
        }
      } else {
        console.log('⚠️ No hay permisos disponibles para asignar');
      }
    }
    
    console.log('\n🎉 Verificación de permisos del admin completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAdminPermissions();
