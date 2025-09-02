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

async function testExactError() {
  let connection;
  
  try {
    console.log('🔍 Reproduciendo exactamente el error del endpoint...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Usar exactamente los mismos IDs que están causando el error
    const ids = [
      '3D75FE719E8B0172E063AC1020498E5B',
      '3D75FE719E8D0172E063AC1020498E5B',
      '3D75F2C616C4023EE063AC102049BEA1',
      '3D75F2C616C5023EE063AC102049BEA1',
      '3D75FFABC6620174E063AC102049403A',
      '3D75F2C616C6023EE063AC102049BEA1',
      '3D75F2C616C7023EE063AC102049BEA1',
      '3D75F2C616C8023EE063AC102049BEA1'
    ];

    console.log('1. IDs exactos del error:');
    console.log(`   🔍 Cantidad: ${ids.length}`);
    console.log(`   🔍 IDs: ${ids.join(', ')}`);

    // Simular exactamente la lógica del endpoint
    console.log('\n2. Simulando lógica del endpoint...');
    
    // Validar IDs
    const validIds = ids.filter(id => typeof id === 'string' && id.trim().length > 0);
    console.log(`   🔍 IDs válidos: ${validIds.length}`);
    
    if (validIds.length === 0) {
      console.log('   ❌ No hay IDs válidos');
      return;
    }

    // Aplicar límite
    const maxIds = 100;
    let finalIds = validIds;
    if (validIds.length > maxIds) {
      console.log(`   ⚠️ Limitando de ${validIds.length} a ${maxIds} IDs`);
      finalIds = validIds.slice(0, maxIds);
    }
    
    console.log(`   🔍 IDs finales: ${finalIds.length}`);

    // Generar SQL exactamente como el endpoint
    const placeholders = finalIds.map((_, index) => `:${index + 1}`).join(',');
    const sql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${placeholders})
    `;
    
    console.log('\n3. SQL generado:');
    console.log(`   🔍 SQL: ${sql}`);
    console.log(`   🔍 Placeholders: ${placeholders}`);
    console.log(`   🔍 Cantidad de placeholders: ${finalIds.length}`);
    console.log(`   🔍 Cantidad de valores: ${finalIds.length}`);

    // Verificar que los placeholders coinciden con los valores
    const placeholderCount = (sql.match(/:/g) || []).length;
    console.log(`   🔍 Placeholders encontrados en SQL: ${placeholderCount}`);
    
    if (placeholderCount !== finalIds.length) {
      console.log('   ❌ ERROR: Los placeholders no coinciden con los valores!');
      return;
    }

    // Ejecutar la consulta
    console.log('\n4. Ejecutando consulta...');
    try {
      const result = await connection.execute(sql, finalIds);
      console.log(`   ✅ Éxito! Encontrados ${result.rows.length} contribuyentes`);
      
      // Mostrar resultados
      result.rows.forEach((row, i) => {
        console.log(`      ${i + 1}. ID: "${row[0]}", RIF: "${row[1]}"`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   🔍 Código: ${error.code}`);
      
      // Intentar con menos IDs
      console.log('\n5. Probando con menos IDs...');
      const fewIds = finalIds.slice(0, 3);
      const fewPlaceholders = fewIds.map((_, index) => `:${index + 1}`).join(',');
      const fewSql = `
        SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID IN (${fewPlaceholders})
      `;
      
      try {
        const fewResult = await connection.execute(fewSql, fewIds);
        console.log(`   ✅ Con 3 IDs funciona! Encontrados ${fewResult.rows.length} contribuyentes`);
      } catch (fewError) {
        console.log(`   ❌ Error con 3 IDs: ${fewError.message}`);
      }
    }

    console.log('\n✅ Prueba de error exacto completada!');

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

testExactError(); 