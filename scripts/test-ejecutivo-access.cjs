const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function testEjecutivoAccess() {
  let connection;
  
  try {
    console.log('🧪 PROBANDO ACCESO DE USUARIO EJECUTIVO');
    console.log('=' .repeat(60));
    
    // Conectar a Oracle
    console.log('\n🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar usuario ejecutivo de ejemplo
    console.log('\n📋 1. VERIFICANDO USUARIO EJECUTIVO DE EJEMPLO:');
    console.log('=' .repeat(50));
    
    const ejecutivoUser = await connection.execute(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE r.NAME = 'EJECUTIVO' AND ROWNUM = 1
    `);
    
    if (ejecutivoUser.rows.length === 0) {
      console.log('❌ No se encontraron usuarios ejecutivos');
      return;
    }
    
    const user = ejecutivoUser.rows[0];
    console.log(`✅ Usuario ejecutivo encontrado:`);
    console.log(`   - ID: ${user[0]}`);
    console.log(`   - Username: ${user[1]}`);
    console.log(`   - Email: ${user[2]}`);
    console.log(`   - Nombre: ${user[3]} ${user[4]}`);
    console.log(`   - Rol: ${user[5]}`);
    
    // 2. Verificar permisos del usuario
    console.log('\n📋 2. VERIFICANDO PERMISOS DEL USUARIO:');
    console.log('=' .repeat(50));
    
    const userPermissions = await connection.execute(`
      SELECT p.NAME, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      JOIN CGBRITO.USERS u ON u.ROLE_ID = r.ID
      WHERE u.ID = :userId
      ORDER BY p.RESOURCE_NAME, p.ACTION_NAME
    `, { userId: user[0] });
    
    console.log(`Total de permisos: ${userPermissions.rows.length}`);
    
    // Agrupar permisos por recurso
    const permissionsByResource = {};
    userPermissions.rows.forEach(row => {
      const resource = row[1];
      if (!permissionsByResource[resource]) {
        permissionsByResource[resource] = [];
      }
      permissionsByResource[resource].push(`${resource}.${row[2]}`);
    });
    
    console.log('\nPermisos por recurso:');
    Object.keys(permissionsByResource).forEach(resource => {
      console.log(`\n   📁 ${resource.toUpperCase()}:`);
      permissionsByResource[resource].forEach(perm => {
        console.log(`      ✅ ${perm}`);
      });
    });
    
    // 3. Verificar acceso a módulos específicos
    console.log('\n📋 3. VERIFICANDO ACCESO A MÓDULOS:');
    console.log('=' .repeat(50));
    
    const requiredModules = [
      { name: 'Tickets', permissions: ['tickets.read', 'tickets.create', 'tickets.update', 'tickets.manage'] },
      { name: 'Cartera de Contribuyentes', permissions: ['cartera.read', 'cartera.manage'] },
      { name: 'Pagos Ejecutados', permissions: ['pagos.read', 'pagos.manage'] },
      { name: 'Metabase', permissions: ['metabase.access'] },
      { name: 'Obligaciones Fiscales', permissions: ['obligaciones.read'] },
      { name: 'Configuración', permissions: ['configuracion.read'] },
      { name: 'Ayuda', permissions: ['ayuda.read'] },
      { name: 'Cuentas', permissions: ['cuentas.read'] },
      { name: 'Dashboard', permissions: ['dashboard.access', 'dashboard.metrics'] },
      { name: 'Reportes', permissions: ['reports.access'] }
    ];
    
    console.log('Verificación de acceso a módulos:');
    requiredModules.forEach(module => {
      const hasAllPermissions = module.permissions.every(perm => 
        userPermissions.rows.some(row => row[0] === perm)
      );
      
      if (hasAllPermissions) {
        console.log(`   ✅ ${module.name}: Acceso completo`);
      } else {
        const missingPerms = module.permissions.filter(perm => 
          !userPermissions.rows.some(row => row[0] === perm)
        );
        console.log(`   ❌ ${module.name}: Faltan permisos: ${missingPerms.join(', ')}`);
      }
    });
    
    // 4. Resumen de acceso
    console.log('\n📋 4. RESUMEN DE ACCESO:');
    console.log('=' .repeat(50));
    
    const totalModules = requiredModules.length;
    const accessibleModules = requiredModules.filter(module => 
      module.permissions.every(perm => 
        userPermissions.rows.some(row => row[0] === perm)
      )
    ).length;
    
    console.log(`📊 Total de módulos requeridos: ${totalModules}`);
    console.log(`✅ Módulos accesibles: ${accessibleModules}`);
    console.log(`❌ Módulos sin acceso: ${totalModules - accessibleModules}`);
    
    if (accessibleModules === totalModules) {
      console.log('\n🎉 ¡USUARIO EJECUTIVO TIENE ACCESO COMPLETO A TODOS LOS MÓDULOS!');
    } else {
      console.log('\n⚠️  Usuario ejecutivo tiene acceso limitado a algunos módulos');
    }
    
    // 5. Credenciales de prueba
    console.log('\n📋 5. CREDENCIALES DE PRUEBA:');
    console.log('=' .repeat(50));
    
    console.log('Para probar el acceso, usar estas credenciales:');
    console.log(`   👤 Username: ${user[1]}`);
    console.log(`   🔑 Password: venezuela1`);
    console.log(`   📧 Email: ${user[2]}`);
    console.log(`   🏷️  Rol: ${user[5]}`);
    
    console.log('\n🔗 URLs de módulos disponibles:');
    console.log('   - Dashboard: /dashboard');
    console.log('   - Tickets: /tickets');
    console.log('   - Cartera de Contribuyentes: /cartera-contribuyentes');
    console.log('   - Pagos Ejecutados: /pagos-ejecutados');
    console.log('   - Metabase: /metabase');
    console.log('   - Configuración: /configuracion');
    console.log('   - Ayuda: /ayuda');
    
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
  testEjecutivoAccess()
    .then(() => {
      console.log('\n✨ Prueba completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { testEjecutivoAccess };
