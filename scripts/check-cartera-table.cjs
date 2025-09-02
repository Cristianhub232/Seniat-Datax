const oracledb = require('oracledb');

async function checkCarteraTable() {
  console.log('🔍 Verificando estructura de tabla CARTERA_CONTRIBUYENTES...\\n');
  
  let connection;
  
  try {
    // Configuración de conexión
    const config = {
      user: process.env.DB_USER || 'CGBRITO',
      password: process.env.DB_PASSWORD || 'CGBRITO123',
      connectString: process.env.DB_CONNECTION_STRING || 'localhost:1521/XE',
      privilege: oracledb.SYSDBA
    };
    
    console.log('1. Conectando a la base de datos...');
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa');
    
    // 2. Verificar estructura de la tabla
    console.log('\\n2. Verificando estructura de la tabla...');
    const tableQuery = `
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
    
    const tableResult = await connection.execute(tableQuery);
    console.log('📋 Estructura de la tabla:');
    tableResult.rows.forEach(row => {
      console.log(`   ${row[0]} (${row[1]}${row[2] ? `(${row[2]})` : ''}) ${row[3] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 3. Verificar datos de ejemplo
    console.log('\\n3. Verificando datos de ejemplo...');
    const dataQuery = `
      SELECT 
        ID,
        RIF,
        TIPO_CONTRIBUYENTE,
        USUARIO_ID,
        CREATED_AT,
        UPDATED_AT
      FROM CARTERA_CONTRIBUYENTES 
      WHERE ROWNUM <= 3
    `;
    
    const dataResult = await connection.execute(dataQuery);
    console.log('📋 Datos de ejemplo:');
    dataResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row[0]}, RIF: ${row[1]}, Tipo: ${row[2]}, Usuario: ${row[3]}`);
    });
    
    // 4. Verificar restricciones
    console.log('\\n4. Verificando restricciones...');
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
    
    // 5. Probar consulta DELETE
    console.log('\\n5. Probando consulta DELETE...');
    const testId = dataResult.rows[0] ? dataResult.rows[0][0] : null;
    
    if (testId) {
      console.log(`   Probando DELETE con ID: ${testId}`);
      
      // Primero verificar que existe
      const checkQuery = `SELECT COUNT(*) FROM CARTERA_CONTRIBUYENTES WHERE ID = :id`;
      const checkResult = await connection.execute(checkQuery, [testId]);
      console.log(`   Registros encontrados: ${checkResult.rows[0][0]}`);
      
      if (checkResult.rows[0][0] > 0) {
        console.log('   ✅ Registro existe, procediendo con DELETE...');
        
        // Intentar DELETE
        const deleteQuery = `DELETE FROM CARTERA_CONTRIBUYENTES WHERE ID = :id`;
        const deleteResult = await connection.execute(deleteQuery, [testId]);
        
        console.log(`   ✅ DELETE ejecutado. Filas afectadas: ${deleteResult.rowsAffected}`);
        
        // Verificar que fue eliminado
        const verifyResult = await connection.execute(checkQuery, [testId]);
        console.log(`   Registros restantes: ${verifyResult.rows[0][0]}`);
        
        // Rollback para no eliminar el dato real
        await connection.rollback();
        console.log('   🔄 Rollback ejecutado (no se eliminó permanentemente)');
      }
    }
    
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

checkCarteraTable(); 