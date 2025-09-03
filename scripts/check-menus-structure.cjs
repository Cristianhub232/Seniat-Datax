const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function checkMenusStructure() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USERNAME || 'CGBRITO',
      password: process.env.ORACLE_PASSWORD || 'cgkbrito',
      connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`
    });
    
    console.log('✅ Conexión exitosa a Oracle\n');
    
    // Revisar estructura de la tabla MENUS
    console.log('📋 Estructura de la tabla MENUS:');
    try {
      const columnsResult = await connection.execute(
        `SELECT column_name, data_type, data_length, nullable, data_default 
         FROM user_tab_columns 
         WHERE table_name = 'MENUS' 
         ORDER BY column_id`
      );
      
      if (columnsResult.rows && columnsResult.rows.length > 0) {
        columnsResult.rows.forEach(row => {
          console.log(`   ${row[0]} (${row[1]}${row[2] ? '(' + row[2] + ')' : ''}) ${row[3] === 'N' ? 'NOT NULL' : 'NULL'}`);
        });
      } else {
        console.log('   ❌ Tabla MENUS no encontrada');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando estructura: ${error.message}`);
    }
    
    // Revisar datos de la tabla MENUS
    console.log('\n📊 Datos en la tabla MENUS:');
    try {
      const menusResult = await connection.execute(
        `SELECT * FROM MENUS ORDER BY ID`
      );
      
      if (menusResult.rows && menusResult.rows.length > 0) {
        console.log(`   Total de menús: ${menusResult.rows.length}`);
        
        // Mostrar las primeras filas como ejemplo
        const sampleRows = menusResult.rows.slice(0, 3);
        sampleRows.forEach((row, index) => {
          console.log(`   Menú ${index + 1}:`);
          menusResult.metaData.forEach((column, colIndex) => {
            console.log(`     ${column.name}: ${row[colIndex]}`);
          });
          console.log('');
        });
        
        if (menusResult.rows.length > 3) {
          console.log(`   ... y ${menusResult.rows.length - 3} menús más`);
        }
      } else {
        console.log('   ❌ No hay menús');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando datos: ${error.message}`);
    }
    
    // Revisar restricciones de la tabla MENUS
    console.log('\n🔒 Restricciones de la tabla MENUS:');
    try {
      const constraintsResult = await connection.execute(
        `SELECT constraint_name, constraint_type, search_condition 
         FROM user_constraints 
         WHERE table_name = 'MENUS'
         ORDER BY constraint_type`
      );
      
      if (constraintsResult.rows && constraintsResult.rows.length > 0) {
        constraintsResult.rows.forEach(row => {
          console.log(`   ${row[0]} (${row[1]}) ${row[2] ? '- ' + row[2] : ''}`);
        });
      } else {
        console.log('   No se encontraron restricciones');
      }
    } catch (error) {
      console.log(`   ❌ Error revisando restricciones: ${error.message}`);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\n🔌 Conexión cerrada');
      } catch (error) {
        console.error('Error cerrando conexión:', error.message);
      }
    }
  }
}

checkMenusStructure();
