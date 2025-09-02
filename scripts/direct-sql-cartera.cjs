const oracledb = require('oracledb');

async function directSqlCartera() {
  console.log('🔍 Consulta SQL directa a CARTERA_CONTRIBUYENTES...\\n');
  
  let connection;
  
  try {
    // Configuración de conexión
    const config = {
      user: process.env.ORACLE_USERNAME || 'CGBRITO',
      password: process.env.ORACLE_PASSWORD || 'cgkbrito',
      connectString: process.env.ORACLE_HOST ? `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}` : '172.16.32.73:1521/DWREPO'
    };
    
    console.log('1. Conectando a Oracle...');
    console.log('   Host:', config.connectString);
    console.log('   User:', config.user);
    
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa');
    
    // 2. Verificar estructura de la tabla
    console.log('\\n2. Estructura de la tabla CARTERA_CONTRIBUYENTES:');
    const structureQuery = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        DATA_LENGTH,
        NULLABLE,
        COLUMN_ID
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = 'CARTERA_CONTRIBUYENTES'
      ORDER BY COLUMN_ID
    `;
    
    const structureResult = await connection.execute(structureQuery);
    console.log('📋 Columnas:');
    structureResult.rows.forEach(row => {
      console.log(`   ${row[0]} (${row[1]}${row[2] ? `(${row[2]})` : ''}) ${row[3] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 3. Verificar datos de ejemplo
    console.log('\\n3. Datos de ejemplo (primeros 5 registros):');
    const dataQuery = `
      SELECT 
        ID,
        RIF,
        TIPO_CONTRIBUYENTE,
        USUARIO_ID,
        CREATED_AT,
        UPDATED_AT
      FROM CARTERA_CONTRIBUYENTES 
      WHERE ROWNUM <= 5
      ORDER BY CREATED_AT DESC
    `;
    
    const dataResult = await connection.execute(dataQuery);
    console.log('📋 Registros:');
    dataResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row[0]}`);
      console.log(`      RIF: ${row[1]}`);
      console.log(`      Tipo: ${row[2]}`);
      console.log(`      Usuario: ${row[3]}`);
      console.log(`      Creado: ${row[4]}`);
      console.log(`      Actualizado: ${row[5]}`);
      console.log('');
    });
    
    // 4. Verificar tipos de datos específicos
    console.log('4. Verificando tipos de datos:');
    if (dataResult.rows.length > 0) {
      const firstRow = dataResult.rows[0];
      console.log(`   ID tipo: ${typeof firstRow[0]}`);
      console.log(`   ID longitud: ${firstRow[0] ? firstRow[0].length : 'undefined'}`);
      console.log(`   ID valor: ${firstRow[0]}`);
      console.log(`   RIF tipo: ${typeof firstRow[1]}`);
      console.log(`   RIF valor: ${firstRow[1]}`);
    }
    
    // 5. Probar consulta específica con un ID
    console.log('\\n5. Probando consulta con ID específico:');
    if (dataResult.rows.length > 0) {
      const testId = dataResult.rows[0][0];
      console.log(`   ID de prueba: ${testId}`);
      
      // Probar consulta exacta
      const exactQuery = `SELECT COUNT(*) as count FROM CARTERA_CONTRIBUYENTES WHERE ID = :id`;
      const exactResult = await connection.execute(exactQuery, [testId]);
      console.log(`   Registros encontrados (exacto): ${exactResult.rows[0][0]}`);
      
      // Probar consulta con LIKE
      const likeQuery = `SELECT COUNT(*) as count FROM CARTERA_CONTRIBUYENTES WHERE ID LIKE :id`;
      const likeResult = await connection.execute(likeQuery, [testId]);
      console.log(`   Registros encontrados (LIKE): ${likeResult.rows[0][0]}`);
      
      // Probar consulta con LIKE parcial
      const partialQuery = `SELECT COUNT(*) as count FROM CARTERA_CONTRIBUYENTES WHERE ID LIKE :id`;
      const partialResult = await connection.execute(partialQuery, [`%${testId}%`]);
      console.log(`   Registros encontrados (LIKE %): ${partialResult.rows[0][0]}`);
      
      // Probar consulta SELECT completa
      const selectQuery = `SELECT ID, RIF, TIPO_CONTRIBUYENTE FROM CARTERA_CONTRIBUYENTES WHERE ID = :id`;
      const selectResult = await connection.execute(selectQuery, [testId]);
      console.log(`   Datos encontrados: ${selectResult.rows.length} filas`);
      if (selectResult.rows.length > 0) {
        console.log(`   Datos: ${JSON.stringify(selectResult.rows[0])}`);
      }
    }
    
    // 6. Verificar restricciones y índices
    console.log('\\n6. Restricciones e índices:');
    const constraintsQuery = `
      SELECT 
        CONSTRAINT_NAME,
        CONSTRAINT_TYPE,
        COLUMN_NAME
      FROM USER_CONS_COLUMNS 
      WHERE TABLE_NAME = 'CARTERA_CONTRIBUYENTES'
      ORDER BY POSITION
    `;
    
    const constraintsResult = await connection.execute(constraintsQuery);
    console.log('📋 Restricciones:');
    constraintsResult.rows.forEach(row => {
      console.log(`   ${row[0]} (${row[1]}) en ${row[2]}`);
    });
    
    // 7. Verificar índices
    const indexesQuery = `
      SELECT 
        INDEX_NAME,
        COLUMN_NAME
      FROM USER_IND_COLUMNS 
      WHERE TABLE_NAME = 'CARTERA_CONTRIBUYENTES'
      ORDER BY INDEX_NAME, COLUMN_POSITION
    `;
    
    const indexesResult = await connection.execute(indexesQuery);
    console.log('📋 Índices:');
    indexesResult.rows.forEach(row => {
      console.log(`   ${row[0]} en ${row[1]}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\\n✅ Conexión cerrada');
      } catch (err) {
        console.error('Error cerrando conexión:', err.message);
      }
    }
  }
}

directSqlCartera(); 