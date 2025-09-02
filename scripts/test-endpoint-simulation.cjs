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

async function testEndpointSimulation() {
  let connection;
  
  try {
    console.log('🔍 Simulando exactamente el endpoint de eliminación masiva...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Simular los IDs que se están enviando (basado en los logs reales)
    const ids = [
      '3D75FFABC6620174E063AC102049403A',
      '3D75FE719E8B0172E063AC1020498E5B',
      '3D75FE719E8D0172E063AC1020498E5B',
      '3D75F2C616C4023EE063AC102049BEA1',
      '3D75F2C616C5023EE063AC102049BEA1',
      '3D75F2C616C6023EE063AC102049BEA1',
      '3D75F2C616C7023EE063AC102049BEA1',
      '3D75F2C616C8023EE063AC102049BEA1',
      '3D75F2C616C9023EE063AC102049BEA1',
      '3D75F2C61680023EE063AC102049BEA1'
    ];

    console.log('1. IDs simulados del endpoint:');
    console.log(`   🔍 Cantidad: ${ids.length}`);
    console.log(`   🔍 Primeros 3: ${ids.slice(0, 3).join(', ')}`);

    // Simular la validación del endpoint
    console.log('\n2. Simulando validación del endpoint...');
    const validIds = ids.filter(id => typeof id === 'string' && id.trim().length > 0);
    
    console.log(`   🔍 IDs originales: ${ids.length}`);
    console.log(`   🔍 IDs válidos filtrados: ${validIds.length}`);
    console.log(`   🔍 Primeros 3 IDs válidos: ${validIds.slice(0, 3).join(', ')}`);

    if (validIds.length === 0) {
      console.log('   ❌ No se encontraron IDs válidos');
      return;
    }

    // Simular la generación de SQL del endpoint
    console.log('\n3. Simulando generación de SQL...');
    const placeholders = validIds.map((_, index) => `:${index + 1}`).join(',');
    const sql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${placeholders})
    `;
    
    console.log(`   🔍 SQL generado: WHERE ID IN (${placeholders})`);
    console.log(`   🔍 Cantidad de placeholders: ${validIds.length}`);
    console.log(`   🔍 Cantidad de valores a enviar: ${validIds.length}`);

    // Ejecutar la consulta
    console.log('\n4. Ejecutando consulta...');
    try {
      const result = await connection.execute(sql, validIds);
      console.log(`   ✅ Éxito! Encontrados ${result.rows.length} contribuyentes`);
      
      // Mostrar resultados
      result.rows.slice(0, 3).forEach((row, i) => {
        console.log(`      ${i + 1}. ID: "${row[0]}", RIF: "${row[1]}"`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   🔍 Código de error: ${error.code}`);
      
      // Intentar con menos IDs para ver si es un problema de cantidad
      console.log('\n5. Probando con menos IDs...');
      const fewIds = validIds.slice(0, 5);
      const fewPlaceholders = fewIds.map((_, index) => `:${index + 1}`).join(',');
      const fewSql = `
        SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID IN (${fewPlaceholders})
      `;
      
      try {
        const fewResult = await connection.execute(fewSql, fewIds);
        console.log(`   ✅ Con 5 IDs funciona! Encontrados ${fewResult.rows.length} contribuyentes`);
      } catch (fewError) {
        console.log(`   ❌ Error con 5 IDs: ${fewError.message}`);
      }
    }

    // Probar con IDs que realmente existen en la base de datos
    console.log('\n6. Probando con IDs que existen en la BD...');
    const existingIdsResult = await connection.execute(`
      SELECT ID FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      ORDER BY CREATED_AT DESC 
      FETCH FIRST 5 ROWS ONLY
    `);
    
    const existingIds = existingIdsResult.rows.map(row => row[0]);
    console.log(`   🔍 IDs existentes: ${existingIds.length}`);
    console.log(`   🔍 IDs: ${existingIds.join(', ')}`);
    
    const existingPlaceholders = existingIds.map((_, index) => `:${index + 1}`).join(',');
    const existingSql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${existingPlaceholders})
    `;
    
    try {
      const existingResult = await connection.execute(existingSql, existingIds);
      console.log(`   ✅ Con IDs existentes funciona! Encontrados ${existingResult.rows.length} contribuyentes`);
    } catch (existingError) {
      console.log(`   ❌ Error con IDs existentes: ${existingError.message}`);
    }

    console.log('\n✅ Simulación del endpoint completada!');

  } catch (error) {
    console.error('❌ Error en la simulación:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

testEndpointSimulation(); 