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

async function assignEjecutivoPermissions() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar rol ejecutivo
    console.log('\n1️⃣ Verificando rol ejecutivo...');
    const ejecutivoRole = await sequelize.query(`
      SELECT ID, NAME, DESCRIPTION FROM CGBRITO.ROLES WHERE NAME = 'Ejecutivo'
    `, { type: 'SELECT' });
    
    if (!ejecutivoRole || ejecutivoRole.length === 0) {
      console.log('❌ Rol ejecutivo no encontrado');
      return;
    }
    
    const role = ejecutivoRole[0];
    console.log('✅ Rol ejecutivo encontrado:');
    console.log(`   ID: ${role.ID}`);
    console.log(`   Nombre: ${role.NAME}`);
    console.log(`   Descripción: ${role.DESCRIPTION}`);
    
    // 2. Definir permisos apropiados para ejecutivo
    const ejecutivoPermissions = [
      'dashboard.access',
      'dashboard.metrics',
      'ejecutivos.read',
      'ejecutivos.update',
      'tickets.manage',
      'cartera.manage',
      'pagos.manage',
      'reports.access'
    ];
    
    console.log('\n2️⃣ Asignando permisos al rol ejecutivo...');
    console.log(`📋 Permisos a asignar: ${ejecutivoPermissions.length}`);
    
    let assignedCount = 0;
    let skippedCount = 0;
    
    for (const permissionName of ejecutivoPermissions) {
      try {
        // Buscar el permiso por nombre
        const permission = await sequelize.query(`
          SELECT ID FROM CGBRITO.PERMISSIONS WHERE NAME = :permissionName
        `, {
          replacements: { permissionName },
          type: 'SELECT'
        });
        
        if (permission && permission.length > 0) {
          const permissionId = permission[0].ID;
          
          // Verificar si ya existe la relación
          const existingRelation = await sequelize.query(`
            SELECT COUNT(*) as total FROM CGBRITO.ROLE_PERMISSIONS 
            WHERE ROLE_ID = :roleId AND PERMISSION_ID = :permissionId
          `, {
            replacements: { roleId: role.ID, permissionId },
            type: 'SELECT'
          });
          
          if (existingRelation[0].TOTAL > 0) {
            console.log(`  ⚠️ Permiso ${permissionName} ya asignado`);
            skippedCount++;
          } else {
            // Asignar el permiso
            await sequelize.query(`
              INSERT INTO CGBRITO.ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID, CREATED_AT)
              VALUES (:roleId, :permissionId, CURRENT_TIMESTAMP)
            `, {
              replacements: { roleId: role.ID, permissionId },
              type: 'INSERT'
            });
            
            console.log(`  ✅ Asignado: ${permissionName}`);
            assignedCount++;
          }
        } else {
          console.log(`  ❌ Permiso no encontrado: ${permissionName}`);
        }
      } catch (error) {
        if (error.message.includes('ORA-00001')) {
          console.log(`  ⚠️ Permiso ${permissionName} ya asignado (duplicado)`);
          skippedCount++;
        } else {
          console.log(`  ❌ Error asignando ${permissionName}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 Resumen de asignación:`);
    console.log(`   ✅ Asignados: ${assignedCount}`);
    console.log(`   ⚠️ Omitidos: ${skippedCount}`);
    console.log(`   ❌ Errores: ${ejecutivoPermissions.length - assignedCount - skippedCount}`);
    
    // 3. Verificar permisos después de la asignación
    console.log('\n3️⃣ Verificando permisos después de la asignación...');
    const newRolePermissions = await sequelize.query(`
      SELECT p.NAME, p.DESCRIPTION, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
      ORDER BY p.NAME
    `, {
      replacements: { roleId: role.ID },
      type: 'SELECT'
    });
    
    console.log(`📊 Permisos del rol ejecutivo después de la asignación: ${newRolePermissions.length}`);
    
    if (newRolePermissions.length > 0) {
      console.log('\n🔐 Permisos asignados:');
      newRolePermissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.NAME} (${perm.RESOURCE_NAME || 'N/A'} - ${perm.ACTION_NAME || 'N/A'})`);
      });
    }
    
    console.log('\n🎉 Asignación de permisos al ejecutivo completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

assignEjecutivoPermissions();
