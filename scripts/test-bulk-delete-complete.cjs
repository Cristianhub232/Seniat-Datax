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

async function testBulkDeleteComplete() {
  let connection;
  
  try {
    console.log('🔍 Prueba completa de eliminación masiva...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // 1. Obtener contribuyentes existentes
    console.log('1. Obteniendo contribuyentes existentes...');
    const contribuyentesResult = await connection.execute(`
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      ORDER BY CREATED_AT DESC
      FETCH FIRST 10 ROWS ONLY
    `);
    
    const contribuyentes = contribuyentesResult.rows;
    console.log(`   ✅ Encontrados ${contribuyentes.length} contribuyentes`);
    
    if (contribuyentes.length === 0) {
      console.log('   ⚠️ No hay contribuyentes para probar');
      return;
    }

    // 2. Probar con diferentes cantidades de IDs
    const testCases = [
      { name: '1 ID', count: 1 },
      { name: '3 IDs', count: 3 },
      { name: '5 IDs', count: 5 },
      { name: '10 IDs', count: 10 }
    ];

    for (const testCase of testCases) {
      console.log(`\n2. Probando ${testCase.name}...`);
      
      const testIds = contribuyentes.slice(0, testCase.count).map(c => c[0]);
      console.log(`   🔍 IDs a probar: ${testIds.length}`);
      console.log(`   🔍 Primeros 3 IDs: ${testIds.slice(0, 3).join(', ')}`);
      
      // Generar SQL con placeholders
      const placeholders = testIds.map((_, index) => `:${index + 1}`).join(',');
      const sql = `
        SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID IN (${placeholders})
      `;
      
      console.log(`   🔍 SQL generado: WHERE ID IN (${placeholders})`);
      console.log(`   🔍 Cantidad de placeholders: ${testIds.length}`);
      console.log(`   🔍 Cantidad de valores: ${testIds.length}`);
      
      try {
        const result = await connection.execute(sql, testIds);
        console.log(`   ✅ Éxito! Encontrados ${result.rows.length} contribuyentes`);
        
        // Mostrar algunos resultados
        result.rows.slice(0, 3).forEach((row, i) => {
          console.log(`      ${i + 1}. ID: "${row[0]}", RIF: "${row[1]}"`);
        });
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log(`   🔍 Código de error: ${error.code}`);
      }
    }

    // 3. Probar con muchos IDs (simular el error real)
    console.log('\n3. Probando con muchos IDs (simulando error real)...');
    
    // Crear muchos IDs ficticios para probar
    const manyIds = [];
    for (let i = 0; i < 100; i++) {
      manyIds.push(`TEST_ID_${i.toString().padStart(3, '0')}`);
    }
    
    console.log(`   🔍 Cantidad de IDs: ${manyIds.length}`);
    console.log(`   🔍 Primeros 3 IDs: ${manyIds.slice(0, 3).join(', ')}`);
    
    // Generar SQL con muchos placeholders
    const manyPlaceholders = manyIds.map((_, index) => `:${index + 1}`).join(',');
    const manySql = `
      SELECT COUNT(*) as count
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${manyPlaceholders})
    `;
    
    console.log(`   🔍 Cantidad de placeholders: ${manyIds.length}`);
    console.log(`   🔍 Cantidad de valores: ${manyIds.length}`);
    
    try {
      const result = await connection.execute(manySql, manyIds);
      console.log(`   ✅ Éxito con muchos IDs! Resultado: ${result.rows[0][0]}`);
    } catch (error) {
      console.log(`   ❌ Error con muchos IDs: ${error.message}`);
      console.log(`   🔍 Código de error: ${error.code}`);
    }

    // 4. Verificar el problema específico del endpoint
    console.log('\n4. Verificando problema específico del endpoint...');
    
    // Simular exactamente lo que hace el endpoint
    const endpointIds = contribuyentes.slice(0, 5).map(c => c[0]);
    console.log(`   🔍 IDs del endpoint: ${endpointIds.length}`);
    
    // Generar SQL como lo hace el endpoint
    const endpointPlaceholders = endpointIds.map((_, index) => `:${index + 1}`).join(',');
    const endpointSql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${endpointPlaceholders})
    `;
    
    console.log(`   🔍 SQL del endpoint: WHERE ID IN (${endpointPlaceholders})`);
    
    try {
      const result = await connection.execute(endpointSql, endpointIds);
      console.log(`   ✅ Endpoint funciona! Encontrados ${result.rows.length} contribuyentes`);
    } catch (error) {
      console.log(`   ❌ Error en endpoint: ${error.message}`);
      
      // Intentar con valores vacíos para simular el error
      console.log('\n5. Probando con valores vacíos (simulando el error)...');
      try {
        const emptyResult = await connection.execute(endpointSql, []);
        console.log(`   ❌ No debería funcionar con valores vacíos`);
      } catch (emptyError) {
        console.log(`   ✅ Correcto: Error con valores vacíos: ${emptyError.message}`);
      }
    }

    console.log('\n✅ Prueba completa finalizada!');
    console.log('\n📝 Análisis del problema:');
    console.log('   - El error NJS-098 indica que hay placeholders pero no valores');
    console.log('   - Esto puede ocurrir si validIds está vacío');
    console.log('   - O si hay un problema en la generación de placeholders');

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

testBulkDeleteComplete(); 