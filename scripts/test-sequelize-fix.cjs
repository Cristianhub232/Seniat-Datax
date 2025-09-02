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

async function testSequelizeFix() {
  let connection;
  
  try {
    console.log('🔍 Probando nueva estrategia con placeholders de Sequelize...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Usar exactamente los mismos IDs que están causando el error
    const ids = [
      '3D75FFABC6620174E063AC102049403A',
      '3D75FE719E8B0172E063AC1020498E5B',
      '3D75FE719E8D0172E063AC1020498E5B',
      '3D75F2C616C4023EE063AC102049BEA1',
      '3D75F2C616C5023EE063AC102049BEA1',
      '3D75F2C616C6023EE063AC102049BEA1',
      '3D75F2C616C7023EE063AC102049BEA1',
      '3D75F2C616C8023EE063AC102049BEA1',
      '3D75F2C616C9023EE063AC102049BEA1'
    ];

    console.log('1. IDs de prueba:');
    console.log(`   🔍 Cantidad: ${ids.length}`);
    console.log(`   🔍 IDs: ${ids.join(', ')}`);

    // Probar estrategia 1: Placeholders de Sequelize (?)
    console.log('\n2. Probando estrategia 1: Placeholders de Sequelize (?)');
    const sequelizePlaceholders = ids.map(() => '?').join(',');
    const sequelizeSql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${sequelizePlaceholders})
    `;
    
    console.log(`   🔍 SQL: ${sequelizeSql}`);
    console.log(`   🔍 Placeholders: ${sequelizePlaceholders}`);
    console.log(`   🔍 Cantidad de placeholders: ${ids.length}`);
    console.log(`   🔍 Cantidad de valores: ${ids.length}`);
    
    try {
      const result = await connection.execute(sequelizeSql, ids);
      console.log(`   ✅ Éxito! Encontrados ${result.rows.length} contribuyentes`);
      
      // Mostrar resultados
      result.rows.forEach((row, i) => {
        console.log(`      ${i + 1}. ID: "${row[0]}", RIF: "${row[1]}"`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   🔍 Código: ${error.code}`);
    }

    // Probar estrategia 2: Placeholders de Oracle (:1, :2, etc.)
    console.log('\n3. Probando estrategia 2: Placeholders de Oracle (:1, :2, etc.)');
    const oraclePlaceholders = ids.map((_, index) => `:${index + 1}`).join(',');
    const oracleSql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${oraclePlaceholders})
    `;
    
    console.log(`   🔍 SQL: ${oracleSql}`);
    console.log(`   🔍 Placeholders: ${oraclePlaceholders}`);
    console.log(`   🔍 Cantidad de placeholders: ${ids.length}`);
    console.log(`   🔍 Cantidad de valores: ${ids.length}`);
    
    try {
      const result = await connection.execute(oracleSql, ids);
      console.log(`   ✅ Éxito! Encontrados ${result.rows.length} contribuyentes`);
      
      // Mostrar resultados
      result.rows.forEach((row, i) => {
        console.log(`      ${i + 1}. ID: "${row[0]}", RIF: "${row[1]}"`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   🔍 Código: ${error.code}`);
    }

    // Probar estrategia 3: Concatenación directa (solo para prueba)
    console.log('\n4. Probando estrategia 3: Concatenación directa (solo para prueba)');
    const directIds = ids.map(id => `'${id}'`).join(',');
    const directSql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${directIds})
    `;
    
    console.log(`   🔍 SQL: ${directSql}`);
    
    try {
      const result = await connection.execute(directSql);
      console.log(`   ✅ Éxito! Encontrados ${result.rows.length} contribuyentes`);
      
      // Mostrar resultados
      result.rows.forEach((row, i) => {
        console.log(`      ${i + 1}. ID: "${row[0]}", RIF: "${row[1]}"`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   🔍 Código: ${error.code}`);
    }

    // Probar con menos IDs
    console.log('\n5. Probando con menos IDs (3)...');
    const fewIds = ids.slice(0, 3);
    const fewPlaceholders = fewIds.map(() => '?').join(',');
    const fewSql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${fewPlaceholders})
    `;
    
    console.log(`   🔍 SQL: ${fewSql}`);
    console.log(`   🔍 IDs: ${fewIds.join(', ')}`);
    
    try {
      const result = await connection.execute(fewSql, fewIds);
      console.log(`   ✅ Éxito! Encontrados ${result.rows.length} contribuyentes`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n✅ Prueba de estrategias completada!');
    console.log('\n📝 Recomendación:');
    console.log('   - Usar placeholders de Sequelize (?) para compatibilidad');
    console.log('   - Evitar placeholders de Oracle (:1, :2) con Sequelize');
    console.log('   - Concatenación directa solo para pruebas, no producción');

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

testSequelizeFix(); 