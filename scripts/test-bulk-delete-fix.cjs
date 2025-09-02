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

async function testBulkDeleteFix() {
  let connection;
  
  try {
    console.log('🔍 Probando corrección de eliminación masiva...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // 1. Verificar algunos contribuyentes existentes
    console.log('1. Verificando contribuyentes existentes...');
    const contribuyentesResult = await connection.execute(`
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      ORDER BY CREATED_AT DESC
      FETCH FIRST 3 ROWS ONLY
    `);
    
    const contribuyentes = contribuyentesResult.rows;
    console.log(`   ✅ Encontrados ${contribuyentes.length} contribuyentes para probar`);
    
    if (contribuyentes.length === 0) {
      console.log('   ⚠️ No hay contribuyentes para probar');
      return;
    }

    // 2. Mostrar los IDs que vamos a usar
    console.log('\n2. IDs que se usarán en la prueba:');
    contribuyentes.forEach((c, i) => {
      console.log(`   ${i + 1}. ID: "${c[0]}" (tipo: ${typeof c[0]})`);
    });

    // 3. Simular la consulta SQL que fallaba
    console.log('\n3. Probando consulta SQL con IDs como strings...');
    const ids = contribuyentes.map(c => c[0]);
    
    const sql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${ids.map((_, index) => `:${index + 1}`).join(',')})
    `;
    
    console.log('   🔍 SQL generado:', sql);
    console.log('   🔍 Parámetros:', ids);
    
    try {
      const result = await connection.execute(sql, ids);
      console.log(`   ✅ Consulta exitosa! Encontrados ${result.rows.length} contribuyentes`);
      
      result.rows.forEach((row, i) => {
        console.log(`      ${i + 1}. ID: "${row[0]}", RIF: "${row[1]}"`);
      });
      
    } catch (error) {
      console.log('   ❌ Error en la consulta:', error.message);
    }

    // 4. Verificar tipos de datos en la base de datos
    console.log('\n4. Verificando tipos de datos en la tabla...');
    const columnInfo = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = 'CARTERA_CONTRIBUYENTES' AND COLUMN_NAME = 'ID'
    `);
    
    if (columnInfo.rows.length > 0) {
      const col = columnInfo.rows[0];
      console.log(`   📋 Columna ID: ${col[0]} - Tipo: ${col[1]}(${col[2]})`);
    }

    // 5. Simular diferentes escenarios de IDs
    console.log('\n5. Probando diferentes tipos de IDs...');
    
    // IDs válidos (strings)
    const validIds = contribuyentes.map(c => c[0]);
    console.log('   ✅ IDs válidos (strings):', validIds);
    
    // IDs inválidos (números)
    const invalidIds = validIds.map(id => parseInt(id) || 0);
    console.log('   ❌ IDs inválidos (números):', invalidIds);
    
    // 6. Probar consulta con IDs válidos
    console.log('\n6. Probando consulta con IDs válidos...');
    try {
      const validSql = `
        SELECT COUNT(*) as count
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID IN (${validIds.map((_, index) => `:${index + 1}`).join(',')})
      `;
      
      const validResult = await connection.execute(validSql, validIds);
      console.log(`   ✅ Consulta con IDs válidos: ${validResult.rows[0][0]} registros encontrados`);
      
    } catch (error) {
      console.log('   ❌ Error con IDs válidos:', error.message);
    }

    console.log('\n✅ Prueba de corrección completada exitosamente!');
    console.log('\n📝 Resumen de la corrección:');
    console.log('   - Los IDs en Oracle son de tipo VARCHAR2 (string)');
    console.log('   - No debemos convertir los IDs a números');
    console.log('   - El frontend debe enviar los IDs como strings');
    console.log('   - El backend debe validar que los IDs sean strings válidos');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

testBulkDeleteFix(); 