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

async function simpleMenuAssignment() {
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
    
    // 2. Asignar menús uno por uno
    console.log('\n2️⃣ Asignando menús al ejecutivo...');
    
    const menusToAssign = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Reportes', path: '/reportes' },
      { name: 'Notificaciones', path: '/notificaciones' }
    ];
    
    let assignedCount = 0;
    
    for (const menuInfo of menusToAssign) {
      try {
        // Buscar el menú
        const menu = await sequelize.query(`
          SELECT ID FROM CGBRITO.MENUS WHERE NAME = :menuName
        `, {
          replacements: { menuName: menuInfo.name },
          type: 'SELECT'
        });
        
        if (menu && menu.length > 0) {
          const menuId = menu[0].ID;
          
          // Verificar si ya existe
          const existing = await sequelize.query(`
            SELECT COUNT(*) as total FROM CGBRITO.ROLE_MENU_PERMISSIONS 
            WHERE ROLE_ID = :roleId AND MENU_ID = :menuId
          `, {
            replacements: { roleId: role.ID, menuId },
            type: 'SELECT'
          });
          
          if (existing[0].TOTAL === 0) {
            // Insertar nueva relación
            await sequelize.query(`
              INSERT INTO CGBRITO.ROLE_MENU_PERMISSIONS (ROLE_ID, MENU_ID, PERMISSION_ID)
              VALUES (:roleId, :menuId, 1)
            `, {
              replacements: { roleId: role.ID, menuId, permissionId: 1 },
              type: 'INSERT'
            });
            
            console.log(`  ✅ Asignado: ${menuInfo.name}`);
            assignedCount++;
          } else {
            console.log(`  ⚠️ Ya asignado: ${menuInfo.name}`);
          }
        } else {
          console.log(`  ❌ Menú no encontrado: ${menuInfo.name}`);
        }
      } catch (error) {
        console.log(`  ❌ Error con ${menuInfo.name}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Total asignados: ${assignedCount}`);
    
    // 3. Verificar resultado final
    console.log('\n3️⃣ Verificando menús finales del ejecutivo...');
    const finalMenus = await sequelize.query(`
      SELECT m.NAME, m.PATH
      FROM CGBRITO.MENUS m
      JOIN CGBRITO.ROLE_MENU_PERMISSIONS rmp ON m.ID = rmp.MENU_ID
      WHERE rmp.ROLE_ID = :roleId
      ORDER BY m.ORDER_INDEX
    `, {
      replacements: { roleId: role.ID },
      type: 'SELECT'
    });
    
    console.log(`📊 Menús finales del ejecutivo: ${finalMenus.length}`);
    
    if (finalMenus.length > 0) {
      console.log('\n🔐 Menús disponibles:');
      finalMenus.forEach((menu, index) => {
        console.log(`   ${index + 1}. ${menu.NAME} (${menu.PATH})`);
      });
    }
    
    console.log('\n🎉 Asignación de menús completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

simpleMenuAssignment();
