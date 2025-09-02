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

async function createPagosMenu() {
  let connection;
  
  try {
    console.log('🔍 Creando menú de pagos ejecutados...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Verificar estructura de la tabla ROLES
    console.log('1. Verificando estructura de la tabla ROLES...');
    
    const rolesStructureQuery = `
      SELECT COLUMN_NAME, DATA_TYPE, NULLABLE
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = 'ROLES'
      ORDER BY COLUMN_ID
    `;
    
    const rolesStructureResult = await connection.execute(rolesStructureQuery);
    const rolesColumns = rolesStructureResult.rows;
    
    console.log(`   ✅ Columnas en tabla ROLES: ${rolesColumns.length}`);
    console.log('   📋 Estructura:');
    rolesColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col[0]} (${col[1]}) - ${col[2] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });

    // Verificar roles disponibles
    console.log('\n2. Verificando roles disponibles...');
    
    const rolesQuery = `
      SELECT ID, NAME, DESCRIPTION
      FROM CGBRITO.ROLES
      ORDER BY NAME
    `;
    
    const rolesResult = await connection.execute(rolesQuery);
    const roles = rolesResult.rows;
    
    console.log(`   ✅ Roles disponibles: ${roles.length}`);
    console.log('   📋 Roles:');
    roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role[1]} - ${role[2]} (ID: ${role[0]})`);
    });

    // Buscar rol EJECUTIVO
    const ejecutivoRole = roles.find(role => role[1].toLowerCase().includes('ejecutivo'));
    const adminRole = roles.find(role => role[1].toLowerCase().includes('admin'));
    
    if (ejecutivoRole) {
      console.log(`\n   ✅ Rol EJECUTIVO encontrado: ${ejecutivoRole[1]} (ID: ${ejecutivoRole[0]})`);
    } else {
      console.log('\n   ❌ No se encontró rol EJECUTIVO');
    }
    
    if (adminRole) {
      console.log(`   ✅ Rol ADMIN encontrado: ${adminRole[1]} (ID: ${adminRole[0]})`);
    } else {
      console.log('\n   ❌ No se encontró rol ADMIN');
    }

    // Obtener el siguiente ID para el menú
    console.log('\n3. Obteniendo siguiente ID para el menú...');
    
    const nextIdQuery = `
      SELECT NVL(MAX(ID), 0) + 1 as NEXT_ID
      FROM CGBRITO.MENUS
    `;
    
    const nextIdResult = await connection.execute(nextIdQuery);
    const nextId = nextIdResult.rows[0][0];
    
    console.log(`   ✅ Siguiente ID disponible: ${nextId}`);

    // Obtener el siguiente ORDER_INDEX
    console.log('\n4. Obteniendo siguiente ORDER_INDEX...');
    
    const nextOrderQuery = `
      SELECT NVL(MAX(ORDER_INDEX), 0) + 1 as NEXT_ORDER
      FROM CGBRITO.MENUS
    `;
    
    const nextOrderResult = await connection.execute(nextOrderQuery);
    const nextOrder = nextOrderResult.rows[0][0];
    
    console.log(`   ✅ Siguiente ORDER_INDEX: ${nextOrder}`);

    // Crear el menú de pagos ejecutados
    console.log('\n5. Creando menú de pagos ejecutados...');
    
    const insertMenuQuery = `
      INSERT INTO CGBRITO.MENUS (
        ID, NAME, PATH, ICON, PARENT_ID, ORDER_INDEX, IS_ACTIVE, CREATED_AT, UPDATED_AT
      ) VALUES (
        :id, :name, :path, :icon, :parentId, :orderIndex, :isActive, SYSDATE, SYSDATE
      )
    `;
    
    const menuData = {
      id: nextId,
      name: 'Pagos Ejecutados',
      path: '/pagos-ejecutados',
      icon: 'credit-card',
      parentId: null,
      orderIndex: nextOrder,
      isActive: 1
    };
    
    await connection.execute(insertMenuQuery, menuData);
    await connection.commit();
    
    console.log(`   ✅ Menú creado: ${menuData.name} (ID: ${menuData.id})`);

    // Verificar si existe la tabla de permisos
    console.log('\n6. Verificando tabla de permisos...');
    
    const permissionsTableQuery = `
      SELECT TABLE_NAME 
      FROM USER_TABLES 
      WHERE TABLE_NAME = 'ROLE_MENU_PERMISSIONS'
    `;
    
    const permissionsTableResult = await connection.execute(permissionsTableQuery);
    const permissionsTableExists = permissionsTableResult.rows.length > 0;
    
    console.log(`   ${permissionsTableExists ? '✅' : '❌'} Tabla ROLE_MENU_PERMISSIONS: ${permissionsTableExists ? 'Existe' : 'No existe'}`);

    if (permissionsTableExists) {
      // Crear permisos para ADMIN
      if (adminRole) {
        console.log('\n7. Creando permisos para ADMIN...');
        
        const insertAdminPermissionQuery = `
          INSERT INTO CGBRITO.ROLE_MENU_PERMISSIONS (
            ROLE_ID, MENU_ID, CAN_VIEW, CAN_EDIT, CREATED_AT, UPDATED_AT
          ) VALUES (
            :roleId, :menuId, 1, 1, SYSDATE, SYSDATE
          )
        `;
        
        await connection.execute(insertAdminPermissionQuery, {
          roleId: adminRole[0],
          menuId: nextId
        });
        
        console.log(`   ✅ Permisos creados para ADMIN (Ver: Sí, Editar: Sí)`);
      }

      // Crear permisos para EJECUTIVO
      if (ejecutivoRole) {
        console.log('\n8. Creando permisos para EJECUTIVO...');
        
        const insertEjecutivoPermissionQuery = `
          INSERT INTO CGBRITO.ROLE_MENU_PERMISSIONS (
            ROLE_ID, MENU_ID, CAN_VIEW, CAN_EDIT, CREATED_AT, UPDATED_AT
          ) VALUES (
            :roleId, :menuId, 1, 0, SYSDATE, SYSDATE
          )
        `;
        
        await connection.execute(insertEjecutivoPermissionQuery, {
          roleId: ejecutivoRole[0],
          menuId: nextId
        });
        
        console.log(`   ✅ Permisos creados para EJECUTIVO (Ver: Sí, Editar: No)`);
      }

      await connection.commit();
    }

    // Verificar que el menú se creó correctamente
    console.log('\n9. Verificando menú creado...');
    
    const verifyMenuQuery = `
      SELECT ID, NAME, PATH, ICON, PARENT_ID, ORDER_INDEX, IS_ACTIVE
      FROM CGBRITO.MENUS 
      WHERE ID = :id
    `;
    
    const verifyMenuResult = await connection.execute(verifyMenuQuery, { id: nextId });
    const createdMenu = verifyMenuResult.rows[0];
    
    if (createdMenu) {
      console.log(`   ✅ Menú verificado: ${createdMenu[1]} (${createdMenu[2]}) - ${createdMenu[3]}`);
    } else {
      console.log('   ❌ Error: El menú no se creó correctamente');
    }

    console.log('\n✅ Proceso completado!');
    console.log('\n📋 Resumen:');
    console.log(`   - Menú creado: ${menuData.name}`);
    console.log(`   - ID: ${menuData.id}`);
    console.log(`   - Path: ${menuData.path}`);
    console.log(`   - Icon: ${menuData.icon}`);
    console.log(`   - Orden: ${menuData.orderIndex}`);
    if (adminRole) console.log(`   - Permisos ADMIN: Ver Sí, Editar Sí`);
    if (ejecutivoRole) console.log(`   - Permisos EJECUTIVO: Ver Sí, Editar No`);

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

createPagosMenu(); 