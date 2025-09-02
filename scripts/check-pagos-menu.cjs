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

async function checkPagosMenu() {
  let connection;
  
  try {
    console.log('🔍 Verificando menú de pagos ejecutados...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Verificar si existe el menú de pagos ejecutados
    console.log('1. Verificando menú de pagos ejecutados...');
    
    const menuQuery = `
      SELECT ID, NAME, PATH, ICON, PARENT_ID, ORDER_INDEX, IS_ACTIVE
      FROM CGBRITO.MENUS 
      WHERE NAME LIKE '%Pagos%' OR NAME LIKE '%pagos%' OR PATH LIKE '%pagos%'
      ORDER BY ORDER_INDEX
    `;
    
    const menuResult = await connection.execute(menuQuery);
    const menus = menuResult.rows;
    
    console.log(`   ✅ Menús encontrados: ${menus.length}`);
    
    if (menus.length > 0) {
      console.log('   📋 Menús relacionados con pagos:');
      menus.forEach((menu, index) => {
        console.log(`   ${index + 1}. ${menu[1]} (${menu[2]}) - ${menu[3]} - Activo: ${menu[6]}`);
      });
    } else {
      console.log('   ❌ No se encontraron menús de pagos');
    }

    // Verificar todos los menús disponibles
    console.log('\n2. Verificando todos los menús disponibles...');
    
    const allMenusQuery = `
      SELECT ID, NAME, PATH, ICON, PARENT_ID, ORDER_INDEX, IS_ACTIVE
      FROM CGBRITO.MENUS 
      WHERE IS_ACTIVE = 1
      ORDER BY ORDER_INDEX
    `;
    
    const allMenusResult = await connection.execute(allMenusQuery);
    const allMenus = allMenusResult.rows;
    
    console.log(`   ✅ Total de menús activos: ${allMenus.length}`);
    console.log('   📋 Menús disponibles:');
    allMenus.forEach((menu, index) => {
      console.log(`   ${index + 1}. ${menu[1]} (${menu[2]}) - ${menu[3]} - Orden: ${menu[5]}`);
    });

    // Verificar roles disponibles
    console.log('\n3. Verificando roles disponibles...');
    
    const rolesQuery = `
      SELECT ID, NAME, DESCRIPTION, STATUS
      FROM CGBRITO.ROLES
      ORDER BY NAME
    `;
    
    const rolesResult = await connection.execute(rolesQuery);
    const roles = rolesResult.rows;
    
    console.log(`   ✅ Roles disponibles: ${roles.length}`);
    console.log('   📋 Roles:');
    roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role[1]} - ${role[2]} (${role[3] ? 'Activo' : 'Inactivo'})`);
    });

    // Verificar si existe el rol EJECUTIVO
    const ejecutivoRole = roles.find(role => role[1].toLowerCase().includes('ejecutivo'));
    if (ejecutivoRole) {
      console.log(`\n   ✅ Rol EJECUTIVO encontrado: ${ejecutivoRole[1]} (ID: ${ejecutivoRole[0]})`);
    } else {
      console.log('\n   ❌ No se encontró rol EJECUTIVO');
    }

    console.log('\n✅ Verificación completada!');

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

checkPagosMenu(); 