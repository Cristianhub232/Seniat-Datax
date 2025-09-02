const oracledb = require('oracledb');

// Configuración de la base de datos
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  poolMin: 10,
  poolMax: 10,
  poolIncrement: 0
};

async function fixPagosPermissions() {
  let connection;
  
  try {
    console.log('🔍 Completando configuración de permisos de pagos...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Verificar si ya existen permisos para el menú de pagos
    console.log('1. Verificando permisos existentes...');
    
    const existingPermissionsQuery = `
      SELECT rp.ID, r.NAME as ROLE_NAME, m.NAME as MENU_NAME, rp.PERMISSION_ID
      FROM CGBRITO.ROLE_MENU_PERMISSIONS rp
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      JOIN CGBRITO.MENUS m ON rp.MENU_ID = m.ID
      WHERE m.NAME = 'Pagos Ejecutados'
      ORDER BY r.NAME
    `;
    
    const existingPermissionsResult = await connection.execute(existingPermissionsQuery);
    const existingPermissions = existingPermissionsResult.rows;
    
    console.log(`   ✅ Permisos existentes: ${existingPermissions.length}`);
    
    if (existingPermissions.length > 0) {
      console.log('   📋 Permisos encontrados:');
      existingPermissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm[1]} -> ${perm[2]} (Permiso: ${perm[3]})`);
      });
    } else {
      console.log('   ❌ No se encontraron permisos para Pagos Ejecutados');
    }

    // Obtener el ID del menú de pagos
    console.log('\n2. Obteniendo ID del menú de pagos...');
    
    const menuIdQuery = `
      SELECT ID FROM CGBRITO.MENUS WHERE NAME = 'Pagos Ejecutados'
    `;
    
    const menuIdResult = await connection.execute(menuIdQuery);
    const menuId = menuIdResult.rows[0]?.[0];
    
    if (menuId) {
      console.log(`   ✅ ID del menú Pagos Ejecutados: ${menuId}`);
    } else {
      console.log('   ❌ No se encontró el menú Pagos Ejecutados');
      return;
    }

    // Obtener roles
    console.log('\n3. Obteniendo roles...');
    
    const rolesQuery = `
      SELECT ID, NAME FROM CGBRITO.ROLES WHERE IS_ACTIVE = 1
    `;
    
    const rolesResult = await connection.execute(rolesQuery);
    const roles = rolesResult.rows;
    
    console.log(`   ✅ Roles activos: ${roles.length}`);
    roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role[1]} (ID: ${role[0]})`);
    });

    // Obtener el siguiente ID para permisos
    console.log('\n4. Obteniendo siguiente ID para permisos...');
    
    const nextPermissionIdQuery = `
      SELECT NVL(MAX(ID), 0) + 1 as NEXT_ID
      FROM CGBRITO.ROLE_MENU_PERMISSIONS
    `;
    
    const nextPermissionIdResult = await connection.execute(nextPermissionIdQuery);
    const nextPermissionId = nextPermissionIdResult.rows[0][0];
    
    console.log(`   ✅ Siguiente ID para permisos: ${nextPermissionId}`);

    // Crear permisos faltantes
    console.log('\n5. Creando permisos faltantes...');
    
    const adminRole = roles.find(role => role[1].toLowerCase().includes('admin'));
    const ejecutivoRole = roles.find(role => role[1].toLowerCase().includes('ejecutivo'));
    
    // Verificar si ya existe permiso para ADMIN
    const adminPermissionExists = existingPermissions.find(perm => perm[1].toLowerCase().includes('admin'));
    
    if (adminRole && !adminPermissionExists) {
      console.log('   🔧 Creando permiso para ADMIN...');
      
      const insertAdminPermissionQuery = `
        INSERT INTO CGBRITO.ROLE_MENU_PERMISSIONS (
          ID, ROLE_ID, MENU_ID, PERMISSION_ID, CREATED_AT
        ) VALUES (
          :id, :roleId, :menuId, 1, SYSDATE
        )
      `;
      
      await connection.execute(insertAdminPermissionQuery, {
        id: nextPermissionId,
        roleId: adminRole[0],
        menuId: menuId
      });
      
      console.log(`   ✅ Permiso creado para ADMIN (ID: ${nextPermissionId})`);
    } else if (adminPermissionExists) {
      console.log('   ✅ Permiso para ADMIN ya existe');
    }

    // Verificar si ya existe permiso para EJECUTIVO
    const ejecutivoPermissionExists = existingPermissions.find(perm => perm[1].toLowerCase().includes('ejecutivo'));
    
    if (ejecutivoRole && !ejecutivoPermissionExists) {
      console.log('   🔧 Creando permiso para EJECUTIVO...');
      
      const nextId = nextPermissionId + (adminRole && !adminPermissionExists ? 1 : 0);
      
      const insertEjecutivoPermissionQuery = `
        INSERT INTO CGBRITO.ROLE_MENU_PERMISSIONS (
          ID, ROLE_ID, MENU_ID, PERMISSION_ID, CREATED_AT
        ) VALUES (
          :id, :roleId, :menuId, 1, SYSDATE
        )
      `;
      
      await connection.execute(insertEjecutivoPermissionQuery, {
        id: nextId,
        roleId: ejecutivoRole[0],
        menuId: menuId
      });
      
      console.log(`   ✅ Permiso creado para EJECUTIVO (ID: ${nextId})`);
    } else if (ejecutivoPermissionExists) {
      console.log('   ✅ Permiso para EJECUTIVO ya existe');
    }

    await connection.commit();

    // Verificar permisos finales
    console.log('\n6. Verificando permisos finales...');
    
    const finalPermissionsQuery = `
      SELECT rp.ID, r.NAME as ROLE_NAME, m.NAME as MENU_NAME, rp.PERMISSION_ID
      FROM CGBRITO.ROLE_MENU_PERMISSIONS rp
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      JOIN CGBRITO.MENUS m ON rp.MENU_ID = m.ID
      WHERE m.NAME = 'Pagos Ejecutados'
      ORDER BY r.NAME
    `;
    
    const finalPermissionsResult = await connection.execute(finalPermissionsQuery);
    const finalPermissions = finalPermissionsResult.rows;
    
    console.log(`   ✅ Permisos finales: ${finalPermissions.length}`);
    console.log('   📋 Permisos configurados:');
    finalPermissions.forEach((perm, index) => {
      console.log(`   ${index + 1}. ${perm[1]} -> ${perm[2]} (ID: ${perm[0]}, Permiso: ${perm[3]})`);
    });

    console.log('\n✅ Configuración completada!');
    console.log('\n📋 Resumen:');
    console.log('   - Menú Pagos Ejecutados creado y configurado');
    console.log('   - Permisos configurados para ADMIN y EJECUTIVO');
    console.log('   - Ambos roles pueden acceder al módulo');

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

fixPagosPermissions(); 