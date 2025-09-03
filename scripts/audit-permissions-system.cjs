const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function auditPermissionsSystem() {
  let connection;
  
  try {
    console.log('🔍 AUDITORÍA COMPLETA DEL SISTEMA DE PERMISOS');
    console.log('=' .repeat(70));
    
    // Conectar a Oracle
    console.log('\n🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. REVISAR TABLA ROLES
    console.log('\n📋 1. REVISANDO TABLA ROLES:');
    console.log('=' .repeat(50));
    
    const roles = await connection.execute(`
      SELECT ID, NAME, DESCRIPTION, CREATED_AT, UPDATED_AT
      FROM CGBRITO.ROLES
      ORDER BY ID
    `);
    
    console.log('Roles existentes:');
    roles.rows.forEach(row => {
      console.log(`   - ID: ${row[0]}, Nombre: ${row[1]}, Descripción: ${row[2]}`);
    });
    
    // 2. REVISAR TABLA PERMISSIONS
    console.log('\n📋 2. REVISANDO TABLA PERMISSIONS:');
    console.log('=' .repeat(50));
    
    const permissions = await connection.execute(`
      SELECT ID, NAME, RESOURCE_NAME, ACTION_NAME, DESCRIPTION, CREATED_AT, UPDATED_AT
      FROM CGBRITO.PERMISSIONS
      ORDER BY RESOURCE_NAME, ACTION_NAME
    `);
    
    console.log('Permisos existentes:');
    permissions.rows.forEach(row => {
      console.log(`   - ID: ${row[0]}, Nombre: ${row[1]}, Recurso: ${row[2]}, Acción: ${row[3]}`);
    });
    
    // 3. REVISAR TABLA ROLE_PERMISSIONS
    console.log('\n📋 3. REVISANDO TABLA ROLE_PERMISSIONS:');
    console.log('=' .repeat(50));
    
    const rolePermissions = await connection.execute(`
      SELECT rp.ID, r.NAME as ROLE_NAME, p.RESOURCE_NAME, p.ACTION_NAME, p.NAME as PERMISSION_NAME
      FROM CGBRITO.ROLE_PERMISSIONS rp
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      JOIN CGBRITO.PERMISSIONS p ON rp.PERMISSION_ID = p.ID
      ORDER BY r.NAME, p.RESOURCE_NAME, p.ACTION_NAME
    `);
    
    console.log('Permisos por rol:');
    rolePermissions.rows.forEach(row => {
      console.log(`   - Rol: ${row[1]}, Recurso: ${row[2]}, Acción: ${row[3]}`);
    });
    
    // 4. REVISAR TABLA MENUS
    console.log('\n📋 4. REVISANDO TABLA MENUS:');
    console.log('=' .repeat(50));
    
    const menus = await connection.execute(`
      SELECT ID, NAME, PATH, ICON, PARENT_ID, ORDER_INDEX, IS_ACTIVE, CREATED_AT, UPDATED_AT
      FROM CGBRITO.MENUS
      ORDER BY ORDER_INDEX, PARENT_ID NULLS FIRST
    `);
    
    console.log('Menús existentes:');
    menus.rows.forEach(row => {
      const parent = row[4] ? `(Padre: ${row[4]})` : '(Menú raíz)';
      console.log(`   - ID: ${row[0]}, Nombre: ${row[1]}, Ruta: ${row[2]}, ${parent}`);
    });
    
    // 5. REVISAR TABLA ROLE_MENU_PERMISSIONS
    console.log('\n📋 5. REVISANDO TABLA ROLE_MENU_PERMISSIONS:');
    console.log('=' .repeat(50));
    
    const roleMenuPermissions = await connection.execute(`
      SELECT rmp.ID, r.NAME as ROLE_NAME, m.NAME as MENU_NAME, m.PATH, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.ROLE_MENU_PERMISSIONS rmp
      JOIN CGBRITO.ROLES r ON rmp.ROLE_ID = r.ID
      JOIN CGBRITO.MENUS m ON rmp.MENU_ID = m.ID
      LEFT JOIN CGBRITO.PERMISSIONS p ON rmp.PERMISSION_ID = p.ID
      ORDER BY r.NAME, m.ORDER_INDEX
    `);
    
    console.log('Permisos de menú por rol:');
    roleMenuPermissions.rows.forEach(row => {
      console.log(`   - Rol: ${row[1]}, Menú: ${row[2]} (${row[3]})`);
    });
    
    // 6. REVISAR PERMISOS ESPECÍFICOS DEL ROL EJECUTIVO
    console.log('\n📋 6. PERMISOS ACTUALES DEL ROL EJECUTIVO:');
    console.log('=' .repeat(50));
    
    const ejecutivoPermissions = await connection.execute(`
      SELECT p.RESOURCE_NAME, p.ACTION_NAME, p.NAME as PERMISSION_NAME
      FROM CGBRITO.ROLE_PERMISSIONS rp
      JOIN CGBRITO.PERMISSIONS p ON rp.PERMISSION_ID = p.ID
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      WHERE r.NAME = 'EJECUTIVO'
      ORDER BY p.RESOURCE_NAME, p.ACTION_NAME
    `);
    
    console.log('Permisos del rol EJECUTIVO:');
    if (ejecutivoPermissions.rows.length === 0) {
      console.log('   ❌ No hay permisos configurados para el rol EJECUTIVO');
    } else {
      ejecutivoPermissions.rows.forEach(row => {
        console.log(`   - ${row[0]}.${row[1]}: ${row[2]}`);
      });
    }
    
    // 7. REVISAR MENÚS ACCESIBLES AL ROL EJECUTIVO
    console.log('\n📋 7. MENÚS ACCESIBLES AL ROL EJECUTIVO:');
    console.log('=' .repeat(50));
    
    const ejecutivoMenus = await connection.execute(`
      SELECT m.NAME, m.PATH, m.ICON, m.ORDER_INDEX
      FROM CGBRITO.ROLE_MENU_PERMISSIONS rmp
      JOIN CGBRITO.MENUS m ON rmp.MENU_ID = m.ID
      JOIN CGBRITO.ROLES r ON rmp.ROLE_ID = r.ID
      WHERE r.NAME = 'EJECUTIVO' AND m.IS_ACTIVE = 1
      ORDER BY m.ORDER_INDEX
    `);
    
    console.log('Menús accesibles al rol EJECUTIVO:');
    if (ejecutivoMenus.rows.length === 0) {
      console.log('   ❌ No hay menús configurados para el rol EJECUTIVO');
    } else {
      ejecutivoMenus.rows.forEach(row => {
        console.log(`   - ${row[0]} (${row[1]}) - Ícono: ${row[2] || 'N/A'}`);
      });
    }
    
    // 8. VERIFICAR ESTRUCTURA DE TABLAS
    console.log('\n📋 8. ESTRUCTURA DE TABLAS DE PERMISOS:');
    console.log('=' .repeat(50));
    
    const tables = ['ROLES', 'PERMISSIONS', 'ROLE_PERMISSIONS', 'MENUS', 'ROLE_MENU_PERMISSIONS'];
    
    for (const table of tables) {
      const structure = await connection.execute(`
        SELECT column_name, data_type, nullable, data_default
        FROM user_tab_columns 
        WHERE table_name = '${table}'
        ORDER BY column_id
      `);
      
      console.log(`\nEstructura de ${table}:`);
      structure.rows.forEach(row => {
        const nullable = row[2] === 'Y' ? 'NULL' : 'NOT NULL';
        const defaultValue = row[3] ? ` = ${row[3]}` : '';
        console.log(`   - ${row[0]}: ${row[1]} ${nullable}${defaultValue}`);
      });
    }
    
    // 9. CONTAR REGISTROS EN CADA TABLA
    console.log('\n📋 9. CONTEO DE REGISTROS:');
    console.log('=' .repeat(50));
    
    for (const table of tables) {
      const count = await connection.execute(`SELECT COUNT(*) FROM CGBRITO.${table}`);
      console.log(`   - ${table}: ${count.rows[0][0]} registros`);
    }
    
    // 10. VERIFICAR INTEGRIDAD REFERENCIAL
    console.log('\n📋 10. VERIFICANDO INTEGRIDAD REFERENCIAL:');
    console.log('=' .repeat(50));
    
    // Verificar roles huérfanos
    const orphanRoles = await connection.execute(`
      SELECT r.ID, r.NAME
      FROM CGBRITO.ROLES r
      LEFT JOIN CGBRITO.ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
      WHERE rp.ROLE_ID IS NULL
    `);
    
    if (orphanRoles.rows.length > 0) {
      console.log('⚠️  Roles sin permisos asignados:');
      orphanRoles.rows.forEach(row => {
        console.log(`   - ${row[1]} (ID: ${row[0]})`);
      });
    } else {
      console.log('✅ Todos los roles tienen permisos asignados');
    }
    
    // Verificar permisos huérfanos
    const orphanPermissions = await connection.execute(`
      SELECT p.ID, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      LEFT JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.PERMISSION_ID IS NULL
    `);
    
    if (orphanPermissions.rows.length > 0) {
      console.log('⚠️  Permisos no asignados a ningún rol:');
      orphanPermissions.rows.forEach(row => {
        console.log(`   - ${row[1]}.${row[2]} (ID: ${row[0]})`);
      });
    } else {
      console.log('✅ Todos los permisos están asignados a algún rol');
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
  auditPermissionsSystem()
    .then(() => {
      console.log('\n✨ Auditoría completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { auditPermissionsSystem };
