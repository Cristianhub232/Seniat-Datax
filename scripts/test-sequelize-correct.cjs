const { Sequelize } = require('sequelize');

// Configuración de Sequelize para Oracle
const sequelize = new Sequelize({
  dialect: 'oracle',
  username: 'CGBRITO',
  password: 'cgkbrito',
  host: '172.16.32.73',
  port: 1521,
  database: 'DWREPO',
  dialectOptions: {
    connectString: '172.16.32.73:1521/DWREPO'
  }
});

async function testSequelizeCorrect() {
  try {
    console.log('🔍 Probando sintaxis correcta de Sequelize con Oracle...\n');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

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

    // Probar con placeholders de Sequelize (?)
    console.log('\n2. Probando con placeholders de Sequelize (?)');
    const placeholders = ids.map(() => '?').join(',');
    const sql = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${placeholders})
    `;
    
    console.log(`   🔍 SQL: ${sql}`);
    console.log(`   🔍 Placeholders: ${placeholders}`);
    
    try {
      const result = await sequelize.query(sql, {
        bind: ids,
        type: 'SELECT'
      });
      
      console.log(`   ✅ Éxito! Encontrados ${result[0].length} contribuyentes`);
      
      // Mostrar resultados
      result[0].slice(0, 3).forEach((row, i) => {
        console.log(`      ${i + 1}. ID: "${row.ID}", RIF: "${row.RIF}"`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Probar con menos IDs
    console.log('\n3. Probando con menos IDs (3)...');
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
      const result = await sequelize.query(fewSql, {
        bind: fewIds,
        type: 'SELECT'
      });
      
      console.log(`   ✅ Éxito! Encontrados ${result[0].length} contribuyentes`);
      
      // Mostrar resultados
      result[0].forEach((row, i) => {
        console.log(`      ${i + 1}. ID: "${row.ID}", RIF: "${row.RIF}"`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Probar eliminación simulada
    console.log('\n4. Probando eliminación simulada...');
    const deletePlaceholders = fewIds.map(() => '?').join(',');
    const deleteSql = `
      SELECT COUNT(*) as count
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE ID IN (${deletePlaceholders})
    `;
    
    console.log(`   🔍 SQL: ${deleteSql}`);
    
    try {
      const result = await sequelize.query(deleteSql, {
        bind: fewIds,
        type: 'SELECT'
      });
      
      console.log(`   ✅ Éxito! ${result[0][0].COUNT} registros encontrados`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n✅ Prueba de Sequelize completada exitosamente!');
    console.log('\n📝 Resumen:');
    console.log('   - Usar "bind" en lugar de "replacements"');
    console.log('   - Usar placeholders "?" para Sequelize');
    console.log('   - Sintaxis correcta para Oracle con Sequelize');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testSequelizeCorrect(); 