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

async function assignMenusEjecutivoCorrect() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar rol ejecutivo
    console.log('\n1️⃣ Verificando rol ejecutivo...');
    const ejecutivoRole = await sequelize.query(`
      SELECT ID, NAME FROM CGBRITO.ROLES WHERE NAME = 'Ejecutivo'
    `, { type: 'SELECT' });
    
    if (!ejecutivoRole || ejecutivoRole.length === 0) {
      console.log('❌ Rol ejecutivo no encontrado');
      return;
    }
    
    const role = ejecutivoRole[0];
    console.log('✅ Rol ejecutivo encontrado:');
    console.log(`   ID: ${role.ID}`);
    console.log(`   Nombre: ${role.NAME}`);
    
    // 2. Obtener menús disponibles
    console.log('\n2️⃣ Obteniendo menús disponibles...');
    const availableMenus = await sequelize.query(`
      SELECT ID, NAME, PATH, ICON FROM CGBRITO.MENUS WHERE IS_ACTIVE = 1 ORDER BY ORDER_INDEX
    `, { type: 'SELECT' });
    
    console.log(`📋 Menús disponibles: ${availableMenus.length}`);
    availableMenus.forEach((menu, index) => {
      console.log(`   ${index + 1}. ${menu.NAME} (${menu.PATH})`);
    });
    
    // 3. Definir qué menús debe tener el ejecutivo
    const ejecutivoMenuNames = [
      'Dashboard',
      'Reportes',
      'Notificaciones'
    ];
    
    console.log('\n3️⃣ Asignando menús al rol ejecutivo...');
    console.log(`📋 Menús a asignar: ${ejecutivoMenuNames.length}`);
    
    let assignedCount = 0;
    let skippedCount = 0;
    
    for (const menuName of ejecutivoMenuNames) {
      try {
        // Buscar el menú por nombre
        const menu = availableMenus.find(m => m.NAME === menuName);
        
        if (menu) {
          // Verificar si ya existe la relación
          const existingRelation = await sequelize.query(`
            SELECT COUNT(*) as total FROM CGBRITO.ROLE_MENU_PERMISSIONS 
            WHERE ROLE_ID = :roleId AND MENU_ID = :menuId
          `, {
            replacements: { roleId: role.ID, menuId: menu.ID },
            type: 'SELECT'
          });
          
          if (existingRelation[0].TOTAL > 0) {
            console.log(`  ⚠️ Menú ${menuName} ya asignado`);
            skippedCount++;
          } else {
            // Buscar un permiso básico para usar como PERMISSION_ID
            const basicPermission = await sequelize.query(`
              SELECT ID FROM CGBRITO.PERMISSIONS 
              WHERE NAME LIKE '%read%' OR NAME LIKE '%access%' 
              LIMIT 1
            `, { type: 'SELECT' });
            
            let permissionId = 1; // Default
            if (basicPermission && basicPermission.length > 0) {
              permissionId = basicPermission[0].ID;
            }
            
            // Asignar el menú usando la estructura correcta
            await sequelize.query(`
              INSERT INTO CGBRITO.ROLE_MENU_PERMISSIONS (ROLE_ID, MENU_ID, PERMISSION_ID)
              VALUES (:roleId, :menuId, :permissionId)
            `, {
              replacements: { roleId: role.ID, menuId: menu.ID, permissionId },
              type: 'INSERT'
            });
            
            console.log(`  ✅ Asignado: ${menuName}`);
            assignedCount++;
          }
        } else {
          console.log(`  ❌ Menú no encontrado: ${menuName}`);
        }
      } catch (error) {
        if (error.message.includes('ORA-00001')) {
          console.log(`  ⚠️ Menú ${menuName} ya asignado (duplicado)`);
          skippedCount++;
        } else {
          console.log(`  ❌ Error asignando ${menuName}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 Resumen de asignación:`);
    console.log(`   ✅ Asignados: ${assignedCount}`);
    console.log(`   ⚠️ Omitidos: ${skippedCount}`);
    console.log(`   ❌ Errores: ${ejecutivoMenuNames.length - assignedCount - skippedCount}`);
    
    // 4. Verificar menús asignados después de la operación
    console.log('\n4️⃣ Verificando menús asignados al ejecutivo...');
    const assignedMenus = await sequelize.query(`
      SELECT m.NAME, m.PATH, m.ICON
      FROM CGBRITO.MENUS m
      JOIN CGBRITO.ROLE_MENU_PERMISSIONS rmp ON m.ID = rmp.MENU_ID
      WHERE rmp.ROLE_ID = :roleId
      ORDER BY m.ORDER_INDEX
    `, {
      replacements: { roleId: role.ID },
      type: 'SELECT'
    });
    
    console.log(`📊 Menús del ejecutivo después de la asignación: ${assignedMenus.length}`);
    
    if (assignedMenus.length > 0) {
      console.log('\n🔐 Menús asignados:');
      assignedMenus.forEach((menu, index) => {
        console.log(`   ${index + 1}. ${menu.NAME} (${menu.PATH})`);
      });
    }
    
    console.log('\n🎉 Asignación de menús al ejecutivo completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

assignMenusEjecutivoCorrect();
