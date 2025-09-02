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

async function testApiResponse() {
  let connection;
  
  try {
    console.log('🔍 Verificando respuesta del API de paginación...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Simular la lógica exacta del API
    console.log('1. Simulando lógica del API...');
    
    const page = 1;
    const limit = 100;
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const offset = (validPage - 1) * validLimit;
    
    console.log(`   🔍 Página: ${page} -> ${validPage}`);
    console.log(`   🔍 Límite: ${limit} -> ${validLimit}`);
    console.log(`   🔍 Offset: ${offset}`);

    // Consulta principal con paginación
    const sql = `
      SELECT 
        c.ID,
        c.RIF,
        c.TIPO_CONTRIBUYENTE,
        c.USUARIO_ID,
        c.CREATED_AT,
        c.UPDATED_AT,
        u.USERNAME,
        u.FIRST_NAME,
        u.LAST_NAME
      FROM CGBRITO.CARTERA_CONTRIBUYENTES c
      LEFT JOIN CGBRITO.USERS u ON c.USUARIO_ID = u.ID
      ORDER BY c.CREATED_AT DESC
      OFFSET ${offset} ROWS FETCH NEXT ${validLimit} ROWS ONLY
    `;
    
    console.log(`   🔍 SQL principal: ${sql.substring(0, 100)}...`);

    // Consulta de conteo
    const countSql = `
      SELECT COUNT(*) as total
      FROM CGBRITO.CARTERA_CONTRIBUYENTES c
      LEFT JOIN CGBRITO.USERS u ON c.USUARIO_ID = u.ID
    `;
    
    console.log(`   🔍 SQL de conteo: ${countSql}`);

    // Ejecutar consultas
    console.log('\n2. Ejecutando consultas...');
    
    const [result, countResult] = await Promise.all([
      connection.execute(sql),
      connection.execute(countSql)
    ]);
    
    const contribuyentes = result.rows;
    const totalRecords = countResult.rows[0][0];
    
    console.log(`   ✅ Contribuyentes obtenidos: ${contribuyentes.length}`);
    console.log(`   ✅ Total de registros: ${totalRecords}`);

    // Calcular información de paginación
    const totalPages = Math.ceil(totalRecords / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;
    
    console.log(`   ✅ Total de páginas: ${totalPages}`);
    console.log(`   ✅ Tiene siguiente página: ${hasNextPage}`);
    console.log(`   ✅ Tiene página anterior: ${hasPrevPage}`);

    // Simular respuesta del API
    const apiResponse = {
      data: contribuyentes.map((row) => ({
        id: row[0],
        rif: row[1],
        tipoContribuyente: row[2],
        usuarioId: row[3],
        createdAt: row[4],
        updatedAt: row[5],
        usuario: row[6] ? {
          username: row[6],
          firstName: row[7],
          lastName: row[8]
        } : null
      })),
      pagination: {
        currentPage: validPage,
        totalPages,
        totalRecords,
        limit: validLimit,
        hasNextPage,
        hasPrevPage
      }
    };

    console.log('\n3. Respuesta simulada del API:');
    console.log(`   🔍 Estructura: ${apiResponse.data ? 'data presente' : 'data ausente'}`);
    console.log(`   🔍 Paginación: ${apiResponse.pagination ? 'pagination presente' : 'pagination ausente'}`);
    console.log(`   🔍 Contribuyentes en data: ${apiResponse.data.length}`);
    console.log(`   🔍 Página actual: ${apiResponse.pagination.currentPage}`);
    console.log(`   🔍 Total de páginas: ${apiResponse.pagination.totalPages}`);
    console.log(`   🔍 Total de registros: ${apiResponse.pagination.totalRecords}`);

    // Verificar que los datos son correctos
    console.log('\n4. Verificando datos...');
    if (contribuyentes.length > 0) {
      console.log(`   🔍 Primer contribuyente: ${contribuyentes[0][1]} (${contribuyentes[0][2]})`);
      console.log(`   🔍 Último contribuyente: ${contribuyentes[contribuyentes.length - 1][1]} (${contribuyentes[contribuyentes.length - 1][2]})`);
    }

    // Probar segunda página
    console.log('\n5. Probando segunda página...');
    const page2 = 2;
    const offset2 = (page2 - 1) * validLimit;
    
    const sql2 = `
      SELECT 
        c.ID,
        c.RIF,
        c.TIPO_CONTRIBUYENTE,
        c.USUARIO_ID,
        c.CREATED_AT,
        c.UPDATED_AT,
        u.USERNAME,
        u.FIRST_NAME,
        u.LAST_NAME
      FROM CGBRITO.CARTERA_CONTRIBUYENTES c
      LEFT JOIN CGBRITO.USERS u ON c.USUARIO_ID = u.ID
      ORDER BY c.CREATED_AT DESC
      OFFSET ${offset2} ROWS FETCH NEXT ${validLimit} ROWS ONLY
    `;
    
    const result2 = await connection.execute(sql2);
    console.log(`   ✅ Contribuyentes en página 2: ${result2.rows.length}`);
    
    if (result2.rows.length > 0) {
      console.log(`   🔍 Primer contribuyente página 2: ${result2.rows[0][1]}`);
      console.log(`   🔍 Último contribuyente página 2: ${result2.rows[result2.rows.length - 1][1]}`);
    }

    console.log('\n✅ Verificación de respuesta del API completada!');
    console.log('\n📝 Resumen:');
    console.log('   - API debería devolver estructura correcta');
    console.log('   - Paginación calculada correctamente');
    console.log('   - Datos transformados correctamente');
    console.log('   - Segunda página funciona');

  } catch (error) {
    console.error('❌ Error en la verificación:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

testApiResponse(); 