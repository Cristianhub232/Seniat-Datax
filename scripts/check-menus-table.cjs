const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function checkMenusTable() {
  let connection;
  
  try {
    console.log('🔍 REVISANDO TABLA MENUS');
    console.log('=' .repeat(50));
    
    // Conectar a Oracle
    console.log('\n🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar estructura de la tabla
    console.log('\n📋 1. ESTRUCTURA DE LA TABLA MENUS:');
    console.log('=' .repeat(50));
    
    const structure = await connection.execute(`
      SELECT column_name, data_type, data_length, nullable
      FROM user_tab_columns 
      WHERE table_name = 'MENUS'
      ORDER BY column_id
    `);
    
    console.log('Columnas de la tabla MENUS:');
    structure.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]}(${row[2]}) ${row[3] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. Contar registros
    console.log('\n📊 2. CONTEO DE REGISTROS:');
    console.log('=' .repeat(50));
    
    const count = await connection.execute('SELECT COUNT(*) FROM CGBRITO.MENUS');
    console.log(`Total de menús: ${count.rows[0][0]}`);
    
    // 3. Verificar si hay datos
    if (count.rows[0][0] > 0) {
      console.log('\n📋 3. DATOS DE LA TABLA MENUS:');
      console.log('=' .repeat(50));
      
      // Intentar consulta simple primero
      try {
        const menus = await connection.execute(`
          SELECT ID, NAME, PATH
          FROM CGBRITO.MENUS
          ORDER BY ID
        `);
        
        console.log('Menús encontrados:');
        menus.rows.forEach(row => {
          console.log(`   - ID: ${row[0]}, Nombre: ${row[1]}, Ruta: ${row[2]}`);
        });
      } catch (error) {
        console.log('❌ Error consultando datos básicos:', error.message);
      }
      
      // Intentar consulta con columnas específicas
      try {
        const menusDetailed = await connection.execute(`
          SELECT ID, NAME, PATH, ICON
          FROM CGBRITO.MENUS
          ORDER BY ID
        `);
        
        console.log('\nMenús con detalles:');
        menusDetailed.rows.forEach(row => {
          console.log(`   - ID: ${row[0]}, Nombre: ${row[1]}, Ruta: ${row[2]}, Ícono: ${row[3] || 'N/A'}`);
        });
      } catch (error) {
        console.log('❌ Error consultando datos detallados:', error.message);
      }
    } else {
      console.log('❌ La tabla MENUS está vacía');
    }
    
    // 4. Verificar si existe tabla ROLE_MENU_PERMISSIONS
    console.log('\n📋 4. VERIFICANDO TABLA ROLE_MENU_PERMISSIONS:');
    console.log('=' .repeat(50));
    
    try {
      const roleMenuCount = await connection.execute('SELECT COUNT(*) FROM CGBRITO.ROLE_MENU_PERMISSIONS');
      console.log(`Total de permisos de menú por rol: ${roleMenuCount.rows[0][0]}`);
      
      if (roleMenuCount.rows[0][0] > 0) {
        const roleMenuData = await connection.execute(`
          SELECT rmp.ID, r.NAME as ROLE_NAME, m.NAME as MENU_NAME
          FROM CGBRITO.ROLE_MENU_PERMISSIONS rmp
          JOIN CGBRITO.ROLES r ON rmp.ROLE_ID = r.ID
          JOIN CGBRITO.MENUS m ON rmp.MENU_ID = m.ID
          ORDER BY r.NAME, m.NAME
        `);
        
        console.log('Permisos de menú por rol:');
        roleMenuData.rows.forEach(row => {
          console.log(`   - Rol: ${row[1]}, Menú: ${row[2]}`);
        });
      }
    } catch (error) {
      console.log('❌ Error con tabla ROLE_MENU_PERMISSIONS:', error.message);
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
  checkMenusTable()
    .then(() => {
      console.log('\n✨ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { checkMenusTable };
