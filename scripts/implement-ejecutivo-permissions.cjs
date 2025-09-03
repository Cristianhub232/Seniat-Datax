const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function implementEjecutivoPermissions() {
  let connection;
  
  try {
    console.log('🚀 IMPLEMENTANDO PERMISOS FALTANTES PARA ROL EJECUTIVO');
    console.log('=' .repeat(70));
    
    // Conectar a Oracle
    console.log('\n🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Configurar autocommit en false para control manual de transacciones
    connection.autoCommit = false;
    
    // 1. Obtener el ID del rol EJECUTIVO
    console.log('\n📋 1. VERIFICANDO ROL EJECUTIVO:');
    console.log('=' .repeat(50));
    
    const ejecutivoRole = await connection.execute(`
      SELECT ID, NAME, DESCRIPTION
      FROM CGBRITO.ROLES
      WHERE NAME = 'EJECUTIVO'
    `);
    
    if (ejecutivoRole.rows.length === 0) {
      throw new Error('No se encontró el rol EJECUTIVO');
    }
    
    const roleId = ejecutivoRole.rows[0][0];
    console.log(`✅ Rol EJECUTIVO encontrado - ID: ${roleId}`);
    
    // 2. Obtener el siguiente ID disponible para permisos
    console.log('\n📋 2. OBTENIENDO SIGUIENTE ID PARA PERMISOS:');
    console.log('=' .repeat(50));
    
    const maxPermissionId = await connection.execute(`
      SELECT MAX(ID) FROM CGBRITO.PERMISSIONS
    `);
    
    const nextPermissionId = (maxPermissionId.rows[0][0] || 0) + 1;
    console.log(`✅ Siguiente ID disponible para permisos: ${nextPermissionId}`);
    
    // 3. Crear permisos faltantes
    console.log('\n📋 3. CREANDO PERMISOS FALTANTES:');
    console.log('=' .repeat(50));
    
    const missingPermissions = [
      { name: 'pagos.read', resource: 'pagos', action: 'read', description: 'Leer pagos ejecutados' },
      { name: 'pagos.manage', resource: 'pagos', action: 'manage', description: 'Gestionar pagos ejecutados' },
      { name: 'metabase.access', resource: 'metabase', action: 'access', description: 'Acceso a Metabase' },
      { name: 'obligaciones.read', resource: 'obligaciones', action: 'read', description: 'Leer obligaciones fiscales' },
      { name: 'configuracion.read', resource: 'configuracion', action: 'read', description: 'Leer configuración' },
      { name: 'ayuda.read', resource: 'ayuda', action: 'read', description: 'Leer ayuda' },
      { name: 'cuentas.read', resource: 'cuentas', action: 'read', description: 'Leer cuentas' }
    ];
    
    const createdPermissions = [];
    
    for (let i = 0; i < missingPermissions.length; i++) {
      const perm = missingPermissions[i];
      const permissionId = nextPermissionId + i;
      
      console.log(`   🔧 Creando permiso: ${perm.name} (ID: ${permissionId})`);
      
      try {
        await connection.execute(`
          INSERT INTO CGBRITO.PERMISSIONS (ID, NAME, RESOURCE_NAME, ACTION_NAME, DESCRIPTION, CREATED_AT, UPDATED_AT)
          VALUES (:1, :2, :3, :4, :5, SYSDATE, SYSDATE)
        `, [permissionId, perm.name, perm.resource, perm.action, perm.description]);
        
        createdPermissions.push({
          id: permissionId,
          name: perm.name,
          resource: perm.resource,
          action: perm.action
        });
        
        console.log(`      ✅ Permiso ${perm.name} creado exitosamente`);
      } catch (error) {
        console.log(`      ❌ Error creando ${perm.name}:`, error.message);
        throw error;
      }
    }
    
    console.log(`\n✅ Total de permisos creados: ${createdPermissions.length}`);
    
    // 4. Asignar permisos al rol EJECUTIVO
    console.log('\n📋 4. ASIGNANDO PERMISOS AL ROL EJECUTIVO:');
    console.log('=' .repeat(50));
    
    // Obtener el siguiente ID para ROLE_PERMISSIONS
    const maxRolePermissionId = await connection.execute(`
      SELECT MAX(ID) FROM CGBRITO.ROLE_PERMISSIONS
    `);
    
    const nextRolePermissionId = (maxRolePermissionId.rows[0][0] || 0) + 1;
    console.log(`✅ Siguiente ID disponible para ROLE_PERMISSIONS: ${nextRolePermissionId}`);
    
    // Asignar permisos faltantes
    let assignedCount = 0;
    
    for (let i = 0; i < createdPermissions.length; i++) {
      const perm = createdPermissions[i];
      const rolePermissionId = nextRolePermissionId + i;
      
      console.log(`   🔗 Asignando permiso ${perm.name} al rol EJECUTIVO`);
      
      try {
        await connection.execute(`
          INSERT INTO CGBRITO.ROLE_PERMISSIONS (ID, ROLE_ID, PERMISSION_ID, CREATED_AT)
          VALUES (:1, :2, :3, SYSDATE)
        `, [rolePermissionId, roleId, perm.id]);
        
        assignedCount++;
        console.log(`      ✅ Permiso ${perm.name} asignado exitosamente`);
      } catch (error) {
        console.log(`      ❌ Error asignando ${perm.name}:`, error.message);
        throw error;
      }
    }
    
    // 5. Asignar permiso tickets.manage que ya existe pero no está asignado
    console.log('\n📋 5. ASIGNANDO PERMISO tickets.manage EXISTENTE:');
    console.log('=' .repeat(50));
    
    const ticketsManagePermission = await connection.execute(`
      SELECT ID FROM CGBRITO.PERMISSIONS WHERE NAME = 'tickets.manage'
    `);
    
    if (ticketsManagePermission.rows.length > 0) {
      const ticketsManageId = ticketsManagePermission.rows[0][0];
      
      // Verificar si ya está asignado
      const alreadyAssigned = await connection.execute(`
        SELECT ID FROM CGBRITO.ROLE_PERMISSIONS 
        WHERE ROLE_ID = :roleId AND PERMISSION_ID = :permissionId
      `, {
        roleId: roleId,
        permissionId: ticketsManageId
      });
      
      if (alreadyAssigned.rows.length === 0) {
        console.log('   🔗 Asignando permiso tickets.manage al rol EJECUTIVO');
        
        const nextId = nextRolePermissionId + assignedCount;
                          await connection.execute(`
            INSERT INTO CGBRITO.ROLE_PERMISSIONS (ID, ROLE_ID, PERMISSION_ID, CREATED_AT)
            VALUES (:1, :2, :3, SYSDATE)
          `, [nextId, roleId, ticketsManageId]);
        
        assignedCount++;
        console.log('      ✅ Permiso tickets.manage asignado exitosamente');
      } else {
        console.log('   ✅ Permiso tickets.manage ya está asignado al rol EJECUTIVO');
      }
    } else {
      console.log('   ❌ Permiso tickets.manage no encontrado');
    }
    
    // 6. Confirmar transacciones
    console.log('\n📋 6. CONFIRMANDO TRANSACCIONES:');
    console.log('=' .repeat(50));
    
    await connection.commit();
    console.log('✅ Todas las transacciones confirmadas');
    
    // 7. Verificar estado final
    console.log('\n📋 7. VERIFICANDO ESTADO FINAL:');
    console.log('=' .repeat(50));
    
    const finalPermissions = await connection.execute(`
      SELECT p.NAME, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
      ORDER BY p.RESOURCE_NAME, p.ACTION_NAME
    `, { roleId });
    
    console.log(`Total de permisos del rol EJECUTIVO: ${finalPermissions.rows.length}`);
    
    // Agrupar por recurso
    const permissionsByResource = {};
    finalPermissions.rows.forEach(row => {
      const resource = row[1];
      if (!permissionsByResource[resource]) {
        permissionsByResource[resource] = [];
      }
      permissionsByResource[resource].push(`${resource}.${row[2]}`);
    });
    
    console.log('\nPermisos finales por recurso:');
    Object.keys(permissionsByResource).forEach(resource => {
      console.log(`\n   📁 ${resource.toUpperCase()}:`);
      permissionsByResource[resource].forEach(perm => {
        console.log(`      ✅ ${perm}`);
      });
    });
    
    // 8. Resumen final
    console.log('\n' + '=' .repeat(70));
    console.log('📊 RESUMEN FINAL DE IMPLEMENTACIÓN');
    console.log('=' .repeat(70));
    console.log(`✅ Permisos creados: ${createdPermissions.length}`);
    console.log(`✅ Permisos asignados: ${assignedCount}`);
    console.log(`✅ Total de permisos del rol EJECUTIVO: ${finalPermissions.rows.length}`);
    
    if (finalPermissions.rows.length >= 16) {
      console.log('\n🎉 ¡IMPLEMENTACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('   El rol EJECUTIVO ahora tiene todos los permisos necesarios');
    } else {
      console.log('\n⚠️  Implementación parcial completada');
      console.log(`   Faltan ${16 - finalPermissions.rows.length} permisos`);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    
    if (connection) {
      try {
        await connection.rollback();
        console.log('🔄 Rollback realizado');
      } catch (rollbackError) {
        console.error('❌ Error en rollback:', rollbackError);
      }
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔒 Conexión a base de datos cerrada');
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  implementEjecutivoPermissions()
    .then(() => {
      console.log('\n✨ Implementación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { implementEjecutivoPermissions };
