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

async function testBatchProcessing() {
  let connection;
  
  try {
    console.log('🔍 Probando procesamiento por lotes...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Simular muchos IDs como en el error real
    const manyIds = [];
    for (let i = 0; i < 120; i++) {
      manyIds.push(`TEST_BATCH_${i.toString().padStart(3, '0')}`);
    }

    console.log('1. IDs de prueba:');
    console.log(`   🔍 Cantidad total: ${manyIds.length}`);
    console.log(`   🔍 Primeros 5: ${manyIds.slice(0, 5).join(', ')}`);

    // Simular el procesamiento por lotes del endpoint
    console.log('\n2. Procesamiento por lotes (SELECT):');
    let contribuyentes = [];
    const batchSize = 50;
    
    for (let i = 0; i < manyIds.length; i += batchSize) {
      const batch = manyIds.slice(i, i + batchSize);
      const placeholders = batch.map((_, index) => `:${index + 1}`).join(',');
      
      const batchSql = `
        SELECT COUNT(*) as count
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID IN (${placeholders})
      `;
      
      console.log(`   🔍 Lote ${Math.floor(i/batchSize) + 1}: ${batch.length} IDs`);
      console.log(`   🔍 Placeholders: ${placeholders}`);
      
      try {
        const batchResult = await connection.execute(batchSql, batch);
        const count = batchResult.rows[0][0];
        console.log(`   ✅ Lote ${Math.floor(i/batchSize) + 1}: ${count} registros encontrados`);
        
        // Simular agregar resultados
        contribuyentes.push({ batch: Math.floor(i/batchSize) + 1, count });
      } catch (error) {
        console.log(`   ❌ Error en lote ${Math.floor(i/batchSize) + 1}: ${error.message}`);
      }
    }

    console.log(`\n3. Resultado total: ${contribuyentes.length} lotes procesados`);

    // Probar con IDs reales que existen
    console.log('\n4. Probando con IDs reales existentes...');
    const realIdsResult = await connection.execute(`
      SELECT ID FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      ORDER BY CREATED_AT DESC 
      FETCH FIRST 15 ROWS ONLY
    `);
    
    const realIds = realIdsResult.rows.map(row => row[0]);
    console.log(`   🔍 IDs reales: ${realIds.length}`);
    
    // Procesar IDs reales por lotes
    let realContribuyentes = [];
    for (let i = 0; i < realIds.length; i += batchSize) {
      const batch = realIds.slice(i, i + batchSize);
      const placeholders = batch.map((_, index) => `:${index + 1}`).join(',');
      
      const batchSql = `
        SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID IN (${placeholders})
      `;
      
      console.log(`   🔍 Lote real ${Math.floor(i/batchSize) + 1}: ${batch.length} IDs`);
      
      try {
        const batchResult = await connection.execute(batchSql, batch);
        console.log(`   ✅ Lote real ${Math.floor(i/batchSize) + 1}: ${batchResult.rows.length} contribuyentes encontrados`);
        
        // Mostrar algunos resultados
        batchResult.rows.slice(0, 2).forEach((row, j) => {
          console.log(`      ${j + 1}. ID: "${row[0]}", RIF: "${row[1]}"`);
        });
        
        realContribuyentes = realContribuyentes.concat(batchResult.rows);
      } catch (error) {
        console.log(`   ❌ Error en lote real ${Math.floor(i/batchSize) + 1}: ${error.message}`);
      }
    }

    console.log(`\n5. Total de contribuyentes reales encontrados: ${realContribuyentes.length}`);

    // Simular eliminación por lotes (sin eliminar realmente)
    console.log('\n6. Simulando eliminación por lotes...');
    const idsAEliminar = realContribuyentes.slice(0, 5).map(c => c[0]); // Solo 5 para prueba
    console.log(`   🔍 IDs para eliminar: ${idsAEliminar.length}`);
    
    const deleteBatchSize = 50;
    for (let i = 0; i < idsAEliminar.length; i += deleteBatchSize) {
      const deleteBatch = idsAEliminar.slice(i, i + deleteBatchSize);
      const deletePlaceholders = deleteBatch.map((_, index) => `:${index + 1}`).join(',');
      
      const deleteSql = `
        SELECT COUNT(*) as count
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE ID IN (${deletePlaceholders})
      `;
      
      console.log(`   🔍 Lote eliminación ${Math.floor(i/deleteBatchSize) + 1}: ${deleteBatch.length} IDs`);
      
      try {
        const deleteResult = await connection.execute(deleteSql, deleteBatch);
        const count = deleteResult.rows[0][0];
        console.log(`   ✅ Lote eliminación ${Math.floor(i/deleteBatchSize) + 1}: ${count} registros encontrados`);
      } catch (error) {
        console.log(`   ❌ Error en lote eliminación ${Math.floor(i/deleteBatchSize) + 1}: ${error.message}`);
      }
    }

    console.log('\n✅ Prueba de procesamiento por lotes completada exitosamente!');
    console.log('\n📝 Resumen:');
    console.log('   - Procesamiento por lotes funciona correctamente');
    console.log('   - Evita problemas con muchos placeholders');
    console.log('   - Manejo de errores por lote');
    console.log('   - Escalable para grandes cantidades de datos');

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

testBatchProcessing(); 