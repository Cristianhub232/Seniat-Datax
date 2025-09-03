const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function checkEjecutivoPermissions() {
  let connection;
  
  try {
    console.log('🔍 REVISANDO PERMISOS DEL ROL EJECUTIVO');
    console.log('=' .repeat(60));
    
    // Conectar a Oracle
    console.log('\n🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar rol EJECUTIVO
    console.log('\n📋 1. VERIFICANDO ROL EJECUTIVO:');
    console.log('=' .repeat(50));
    
    const ejecutivoRole = await connection.execute(`
      SELECT ID, NAME, DESCRIPTION
      FROM CGBRITO.ROLES
      WHERE NAME = 'EJECUTIVO'
    `);
    
    if (ejecutivoRole.rows.length === 0) {
      console.log('❌ No se encontró el rol EJECUTIVO');
      return;
    }
    
    const roleId = ejecutivoRole.rows[0][0];
    console.log(`✅ Rol EJECUTIVO encontrado - ID: ${roleId}`);
    
    // 2. Verificar permisos actuales del rol EJECUTIVO
    console.log('\n📋 2. PERMISOS ACTUALES DEL ROL EJECUTIVO:');
    console.log('=' .repeat(50));
    
    const currentPermissions = await connection.execute(`
      SELECT p.ID, p.NAME, p.RESOURCE_NAME, p.ACTION_NAME, p.DESCRIPTION
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
      ORDER BY p.RESOURCE_NAME, p.ACTION_NAME
    `, { roleId });
    
    console.log(`Total de permisos actuales: ${currentPermissions.rows.length}`);
    
    if (currentPermissions.rows.length > 0) {
      console.log('\nPermisos actuales:');
      currentPermissions.rows.forEach(row => {
        console.log(`   - ${row[2]}.${row[3]}: ${row[1]} (ID: ${row[0]})`);
      });
    } else {
      console.log('❌ No hay permisos configurados para el rol EJECUTIVO');
    }
    
    // 3. Verificar todos los permisos disponibles en el sistema
    console.log('\n📋 3. PERMISOS DISPONIBLES EN EL SISTEMA:');
    console.log('=' .repeat(50));
    
    const allPermissions = await connection.execute(`
      SELECT ID, NAME, RESOURCE_NAME, ACTION_NAME, DESCRIPTION
      FROM CGBRITO.PERMISSIONS
      ORDER BY RESOURCE_NAME, ACTION_NAME
    `);
    
    console.log(`Total de permisos en el sistema: ${allPermissions.rows.length}`);
    
    // Agrupar permisos por recurso
    const permissionsByResource = {};
    allPermissions.rows.forEach(row => {
      const resource = row[2];
      if (!permissionsByResource[resource]) {
        permissionsByResource[resource] = [];
      }
      permissionsByResource[resource].push({
        id: row[0],
        name: row[1],
        action: row[3],
        description: row[4]
      });
    });
    
    console.log('\nPermisos por recurso:');
    Object.keys(permissionsByResource).forEach(resource => {
      console.log(`\n   📁 ${resource.toUpperCase()}:`);
      permissionsByResource[resource].forEach(perm => {
        console.log(`      - ${perm.action}: ${perm.name} (ID: ${perm.id})`);
      });
    });
    
    // 4. Verificar qué permisos necesita el rol EJECUTIVO según los requerimientos
    console.log('\n📋 4. PERMISOS REQUERIDOS PARA EJECUTIVO:');
    console.log('=' .repeat(50));
    
    const requiredPermissions = [
      // Módulos principales
      { resource: 'tickets', actions: ['read', 'create', 'update', 'manage'] },
      { resource: 'cartera', actions: ['read', 'manage'] },
      { resource: 'pagos', actions: ['read', 'manage'] },
      { resource: 'metabase', actions: ['access'] },
      { resource: 'obligaciones', actions: ['read'] },
      { resource: 'configuracion', actions: ['read'] },
      { resource: 'ayuda', actions: ['read'] },
      { resource: 'cuentas', actions: ['read'] },
      // Módulos básicos
      { resource: 'dashboard', actions: ['access', 'metrics'] },
      { resource: 'reports', actions: ['access'] }
    ];
    
    console.log('Permisos requeridos según especificación:');
    requiredPermissions.forEach(req => {
      console.log(`\n   📁 ${req.resource.toUpperCase()}:`);
      req.actions.forEach(action => {
        const permissionName = `${req.resource}.${action}`;
        const found = allPermissions.rows.find(p => p[1] === permissionName);
        if (found) {
          console.log(`      ✅ ${action}: ${permissionName} (ID: ${found[0]})`);
        } else {
          console.log(`      ❌ ${action}: ${permissionName} - NO EXISTE`);
        }
      });
    });
    
    // 5. Verificar permisos faltantes
    console.log('\n📋 5. PERMISOS FALTANTES PARA EJECUTIVO:');
    console.log('=' .repeat(50));
    
    const missingPermissions = [];
    requiredPermissions.forEach(req => {
      req.actions.forEach(action => {
        const permissionName = `${req.resource}.${action}`;
        const found = allPermissions.rows.find(p => p[1] === permissionName);
        if (!found) {
          missingPermissions.push({
            resource: req.resource,
            action: action,
            name: permissionName
          });
        }
      });
    });
    
    if (missingPermissions.length === 0) {
      console.log('✅ Todos los permisos requeridos existen en el sistema');
    } else {
      console.log(`❌ Faltan ${missingPermissions.length} permisos:`);
      missingPermissions.forEach(perm => {
        console.log(`   - ${perm.name} (${perm.resource}.${perm.action})`);
      });
    }
    
    // 6. Verificar permisos que ya tiene el rol EJECUTIVO
    console.log('\n📋 6. PERMISOS YA ASIGNADOS AL ROL EJECUTIVO:');
    console.log('=' .repeat(50));
    
    const alreadyAssigned = [];
    const notAssigned = [];
    
    requiredPermissions.forEach(req => {
      req.actions.forEach(action => {
        const permissionName = `${req.resource}.${action}`;
        const permissionExists = allPermissions.rows.find(p => p[1] === permissionName);
        const isAssigned = currentPermissions.rows.find(p => p[1] === permissionName);
        
        if (permissionExists) {
          if (isAssigned) {
            alreadyAssigned.push(permissionName);
          } else {
            notAssigned.push(permissionName);
          }
        }
      });
    });
    
    console.log(`✅ Permisos ya asignados: ${alreadyAssigned.length}`);
    if (alreadyAssigned.length > 0) {
      alreadyAssigned.forEach(perm => console.log(`   - ${perm}`));
    }
    
    console.log(`❌ Permisos no asignados: ${notAssigned.length}`);
    if (notAssigned.length > 0) {
      notAssigned.forEach(perm => console.log(`   - ${perm}`));
    }
    
    // 7. Resumen final
    console.log('\n📋 7. RESUMEN FINAL:');
    console.log('=' .repeat(50));
    
    const totalRequired = requiredPermissions.reduce((sum, req) => sum + req.actions.length, 0);
    const totalExisting = allPermissions.rows.length;
    const totalAssigned = currentPermissions.rows.length;
    const totalMissing = missingPermissions.length;
    const totalNotAssigned = notAssigned.length;
    
    console.log(`📊 Total de permisos requeridos: ${totalRequired}`);
    console.log(`📊 Total de permisos existentes: ${totalExisting}`);
    console.log(`📊 Total de permisos asignados: ${totalAssigned}`);
    console.log(`📊 Total de permisos faltantes: ${totalMissing}`);
    console.log(`📊 Total de permisos no asignados: ${totalNotAssigned}`);
    
    if (totalMissing === 0 && totalNotAssigned === 0) {
      console.log('\n🎉 ¡El rol EJECUTIVO tiene todos los permisos necesarios!');
    } else {
      console.log('\n⚠️  Se requieren acciones para completar la configuración:');
      if (totalMissing > 0) {
        console.log(`   - Crear ${totalMissing} permisos faltantes`);
      }
      if (totalNotAssigned > 0) {
        console.log(`   - Asignar ${totalNotAssigned} permisos al rol EJECUTIVO`);
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
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
  checkEjecutivoPermissions()
    .then(() => {
      console.log('\n✨ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { checkEjecutivoPermissions };
