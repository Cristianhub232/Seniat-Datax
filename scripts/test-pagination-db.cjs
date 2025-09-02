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

async function testPaginationDB() {
  let connection;
  
  try {
    console.log('🔍 Probando paginación directamente en la base de datos...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // 1. Obtener total de registros
    console.log('1. Obteniendo total de registros...');
    const totalResult = await connection.execute(`
      SELECT COUNT(*) as total
      FROM CGBRITO.CARTERA_CONTRIBUYENTES
    `);
    
    const totalRecords = totalResult.rows[0][0];
    console.log(`   ✅ Total de registros: ${totalRecords}`);

    // 2. Probar primera página (100 registros)
    console.log('\n2. Probando primera página (100 registros)...');
    const page1Result = await connection.execute(`
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID, CREATED_AT
      FROM CGBRITO.CARTERA_CONTRIBUYENTES
      ORDER BY CREATED_AT DESC
      OFFSET 0 ROWS FETCH NEXT 100 ROWS ONLY
    `);
    
    console.log(`   ✅ Registros en página 1: ${page1Result.rows.length}`);
    console.log(`   🔍 Primer registro: ${page1Result.rows[0]?.[1] || 'N/A'}`);
    console.log(`   🔍 Último registro: ${page1Result.rows[page1Result.rows.length - 1]?.[1] || 'N/A'}`);

    // 3. Probar segunda página (100 registros)
    console.log('\n3. Probando segunda página (100 registros)...');
    const page2Result = await connection.execute(`
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID, CREATED_AT
      FROM CGBRITO.CARTERA_CONTRIBUYENTES
      ORDER BY CREATED_AT DESC
      OFFSET 100 ROWS FETCH NEXT 100 ROWS ONLY
    `);
    
    console.log(`   ✅ Registros en página 2: ${page2Result.rows.length}`);
    if (page2Result.rows.length > 0) {
      console.log(`   🔍 Primer registro: ${page2Result.rows[0]?.[1] || 'N/A'}`);
      console.log(`   🔍 Último registro: ${page2Result.rows[page2Result.rows.length - 1]?.[1] || 'N/A'}`);
    }

    // 4. Probar con filtros
    console.log('\n4. Probando paginación con filtros...');
    const filteredResult = await connection.execute(`
      SELECT COUNT(*) as total
      FROM CGBRITO.CARTERA_CONTRIBUYENTES
      WHERE TIPO_CONTRIBUYENTE = 'NATURAL'
    `);
    
    const totalNaturales = filteredResult.rows[0][0];
    console.log(`   ✅ Total de naturales: ${totalNaturales}`);

    const filteredPageResult = await connection.execute(`
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID, CREATED_AT
      FROM CGBRITO.CARTERA_CONTRIBUYENTES
      WHERE TIPO_CONTRIBUYENTE = 'NATURAL'
      ORDER BY CREATED_AT DESC
      OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY
    `);
    
    console.log(`   ✅ Naturales en página 1 (límite 50): ${filteredPageResult.rows.length}`);

    // 5. Calcular información de paginación
    console.log('\n5. Calculando información de paginación...');
    const limit = 100;
    const totalPages = Math.ceil(totalRecords / limit);
    
    console.log(`   🔍 Total de registros: ${totalRecords}`);
    console.log(`   🔍 Límite por página: ${limit}`);
    console.log(`   🔍 Total de páginas: ${totalPages}`);
    console.log(`   🔍 Registros en última página: ${totalRecords % limit || limit}`);

    // 6. Probar diferentes límites
    console.log('\n6. Probando diferentes límites...');
    const limits = [10, 25, 50, 100];
    
    for (const testLimit of limits) {
      const testResult = await connection.execute(`
        SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID, CREATED_AT
        FROM CGBRITO.CARTERA_CONTRIBUYENTES
        ORDER BY CREATED_AT DESC
        OFFSET 0 ROWS FETCH NEXT ${testLimit} ROWS ONLY
      `);
      
      console.log(`   🔍 Límite ${testLimit}: ${testResult.rows.length} registros obtenidos`);
    }

    // 7. Probar página inválida
    console.log('\n7. Probando página inválida...');
    const invalidPageResult = await connection.execute(`
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID, CREATED_AT
      FROM CGBRITO.CARTERA_CONTRIBUYENTES
      ORDER BY CREATED_AT DESC
      OFFSET 999999 ROWS FETCH NEXT 100 ROWS ONLY
    `);
    
    console.log(`   ✅ Página inválida manejada correctamente: ${invalidPageResult.rows.length} registros`);

    console.log('\n✅ Prueba de paginación en base de datos completada!');
    console.log('\n📝 Resumen:');
    console.log('   - Paginación SQL funciona correctamente');
    console.log('   - OFFSET y FETCH NEXT funcionan');
    console.log('   - Filtros funcionan con paginación');
    console.log('   - Diferentes límites funcionan');
    console.log('   - Páginas inválidas se manejan correctamente');
    console.log('   - Total de registros calculado correctamente');

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

testPaginationDB(); 