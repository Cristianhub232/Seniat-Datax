const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function diagnoseCarteraAccess() {
  let connection;
  
  try {
    console.log('🔍 DIAGNÓSTICO DEL PROBLEMA DE ACCESO A CARTERA DE CONTRIBUYENTES');
    console.log('=' .repeat(80));
    
    // Conectar a Oracle
    console.log('\n🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar usuario ejecutivo de ejemplo
    console.log('\n📋 1. VERIFICANDO USUARIO EJECUTIVO DE EJEMPLO:');
    console.log('=' .repeat(60));
    
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
    
    // 2. Verificar permisos específicos de cartera
    console.log('\n📋 2. VERIFICANDO PERMISOS DE CARTERA:');
    console.log('=' .repeat(60));
    
    const carteraPermissions = await connection.execute(`
      SELECT p.ID, p.NAME, p.RESOURCE_NAME, p.ACTION_NAME, p.DESCRIPTION
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      WHERE r.NAME = 'EJECUTIVO' AND p.RESOURCE_NAME = 'cartera'
      ORDER BY p.ACTION_NAME
    `);
    
    console.log(`Total de permisos de cartera para EJECUTIVO: ${carteraPermissions.rows.length}`);
    
    if (carteraPermissions.rows.length > 0) {
      console.log('\nPermisos de cartera encontrados:');
      carteraPermissions.rows.forEach(row => {
        console.log(`   ✅ ${row[2]}.${row[3]}: ${row[1]} (ID: ${row[0]})`);
      });
    } else {
      console.log('❌ No se encontraron permisos de cartera para el rol EJECUTIVO');
    }
    
    // 3. Verificar si el permiso cartera.read existe y está asignado
    console.log('\n📋 3. VERIFICANDO PERMISO cartera.read ESPECÍFICAMENTE:');
    console.log('=' .repeat(60));
    
    const carteraReadPermission = await connection.execute(`
      SELECT p.ID, p.NAME, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      WHERE p.NAME = 'cartera.read'
    `);
    
    if (carteraReadPermission.rows.length > 0) {
      const perm = carteraReadPermission.rows[0];
      console.log(`✅ Permiso cartera.read encontrado:`);
      console.log(`   - ID: ${perm[0]}`);
      console.log(`   - Nombre: ${perm[1]}`);
      console.log(`   - Recurso: ${perm[2]}`);
      console.log(`   - Acción: ${perm[3]}`);
      
      // Verificar si está asignado al rol EJECUTIVO
      const isAssigned = await connection.execute(`
        SELECT rp.ID
        FROM CGBRITO.ROLE_PERMISSIONS rp
        JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
        WHERE r.NAME = 'EJECUTIVO' AND rp.PERMISSION_ID = :permissionId
      `, { permissionId: perm[0] });
      
      if (isAssigned.rows.length > 0) {
        console.log(`   ✅ Permiso cartera.read ASIGNADO al rol EJECUTIVO`);
      } else {
        console.log(`   ❌ Permiso cartera.read NO ASIGNADO al rol EJECUTIVO`);
      }
    } else {
      console.log('❌ Permiso cartera.read NO EXISTE en la base de datos');
    }
    
    // 4. Verificar todos los permisos del rol EJECUTIVO
    console.log('\n📋 4. VERIFICANDO TODOS LOS PERMISOS DEL ROL EJECUTIVO:');
    console.log('=' .repeat(60));
    
    const allPermissions = await connection.execute(`
      SELECT p.NAME, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      WHERE r.NAME = 'EJECUTIVO'
      ORDER BY p.RESOURCE_NAME, p.ACTION_NAME
    `);
    
    console.log(`Total de permisos del rol EJECUTIVO: ${allPermissions.rows.length}`);
    
    // Agrupar por recurso
    const permissionsByResource = {};
    allPermissions.rows.forEach(row => {
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
    
    // 5. Verificar estructura de la tabla PERMISSIONS
    console.log('\n📋 5. VERIFICANDO ESTRUCTURA DE LA TABLA PERMISSIONS:');
    console.log('=' .repeat(60));
    
    const permissionsStructure = await connection.execute(`
      SELECT column_name, data_type, nullable
      FROM user_tab_columns 
      WHERE table_name = 'PERMISSIONS'
      ORDER BY column_id
    `);
    
    console.log('Estructura de la tabla PERMISSIONS:');
    permissionsStructure.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]} ${row[2] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 6. Verificar si hay problemas con mayúsculas/minúsculas
    console.log('\n📋 6. VERIFICANDO PROBLEMAS DE MAYÚSCULAS/MINÚSCULAS:');
    console.log('=' .repeat(60));
    
    const caseSensitiveCheck = await connection.execute(`
      SELECT p.NAME, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      WHERE p.NAME LIKE '%cartera%' OR p.NAME LIKE '%CARTERA%'
    `);
    
    console.log('Permisos que contienen "cartera" (case insensitive):');
    if (caseSensitiveCheck.rows.length > 0) {
      caseSensitiveCheck.rows.forEach(row => {
        console.log(`   - ${row[0]} (${row[1]}.${row[2]})`);
      });
    } else {
      console.log('   ❌ No se encontraron permisos que contengan "cartera"');
    }
    
    // 7. Resumen del diagnóstico
    console.log('\n📋 7. RESUMEN DEL DIAGNÓSTICO:');
    console.log('=' .repeat(60));
    
    const hasCarteraRead = carteraPermissions.rows.some(row => row[3] === 'read');
    const hasCarteraManage = carteraPermissions.rows.some(row => row[3] === 'manage');
    
    console.log(`📊 Estado de permisos de cartera para rol EJECUTIVO:`);
    console.log(`   - cartera.read: ${hasCarteraRead ? '✅ PRESENTE' : '❌ AUSENTE'}`);
    console.log(`   - cartera.manage: ${hasCarteraManage ? '✅ PRESENTE' : '❌ AUSENTE'}`);
    
    if (hasCarteraRead && hasCarteraManage) {
      console.log('\n✅ Los permisos de cartera están correctamente configurados');
      console.log('   El problema puede estar en el frontend o en la verificación de permisos');
    } else {
      console.log('\n❌ Faltan permisos de cartera para el rol EJECUTIVO');
      console.log('   Se requiere configurar los permisos faltantes');
    }
    
    // 8. Recomendaciones
    console.log('\n📋 8. RECOMENDACIONES:');
    console.log('=' .repeat(60));
    
    if (!hasCarteraRead || !hasCarteraManage) {
      console.log('🔧 ACCIONES REQUERIDAS:');
      console.log('   1. Verificar que los permisos cartera.read y cartera.manage existan');
      console.log('   2. Asignar estos permisos al rol EJECUTIVO');
      console.log('   3. Verificar que no haya problemas de case sensitivity');
    } else {
      console.log('🔍 VERIFICACIONES ADICIONALES:');
      console.log('   1. Revisar el hook usePermissions en el frontend');
      console.log('   2. Verificar que el contexto de autenticación tenga los permisos');
      console.log('   3. Revisar la consola del navegador para errores');
      console.log('   4. Verificar que el usuario esté logueado correctamente');
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
  diagnoseCarteraAccess()
    .then(() => {
      console.log('\n✨ Diagnóstico completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseCarteraAccess };
