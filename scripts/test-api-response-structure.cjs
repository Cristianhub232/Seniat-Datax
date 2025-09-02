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

async function testApiResponseStructure() {
  let connection;
  
  try {
    console.log('🔍 Verificando estructura real de respuesta del API...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Simular exactamente la lógica del API
    console.log('1. Ejecutando consultas del API...');
    
    const page = 1;
    const limit = 100;
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const offset = (validPage - 1) * validLimit;
    
    console.log(`   🔍 Parámetros: page=${page}, limit=${limit}`);
    console.log(`   🔍 Validados: validPage=${validPage}, validLimit=${validLimit}, offset=${offset}`);

    // Consulta de conteo
    const countSql = `
      SELECT COUNT(*) as total
      FROM CGBRITO.CARTERA_CONTRIBUYENTES c
      LEFT JOIN CGBRITO.USERS u ON c.USUARIO_ID = u.ID
    `;
    
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

    // Ejecutar consultas
    const [result, countResult] = await Promise.all([
      connection.execute(sql),
      connection.execute(countSql)
    ]);
    
    const contribuyentes = result.rows;
    const totalRecords = countResult.rows[0][0];
    
    console.log(`   ✅ Contribuyentes obtenidos: ${contribuyentes.length}`);
    console.log(`   ✅ Total de registros: ${totalRecords}`);

    // Transformar los datos (exactamente como en el API)
    console.log('\n2. Transformando datos...');
    
    const transformedContribuyentes = contribuyentes.map((contribuyente) => ({
      id: contribuyente[0],
      rif: contribuyente[1],
      tipoContribuyente: contribuyente[2],
      usuarioId: contribuyente[3],
      createdAt: contribuyente[4],
      updatedAt: contribuyente[5],
      usuario: contribuyente[6] ? {
        username: contribuyente[6],
        firstName: contribuyente[7],
        lastName: contribuyente[8]
      } : null
    }));

    console.log(`   ✅ Contribuyentes transformados: ${transformedContribuyentes.length}`);

    // Calcular información de paginación
    console.log('\n3. Calculando paginación...');
    
    const totalPages = Math.ceil(totalRecords / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;
    
    console.log(`   ✅ Total de páginas: ${totalPages}`);
    console.log(`   ✅ Tiene siguiente página: ${hasNextPage}`);
    console.log(`   ✅ Tiene página anterior: ${hasPrevPage}`);

    // Crear respuesta final (exactamente como en el API)
    const apiResponse = {
      data: transformedContribuyentes,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalRecords,
        limit: validLimit,
        hasNextPage,
        hasPrevPage
      }
    };

    console.log('\n4. Estructura de respuesta final:');
    console.log(`   🔍 Tipo de respuesta: ${typeof apiResponse}`);
    console.log(`   🔍 Tiene propiedad 'data': ${'data' in apiResponse}`);
    console.log(`   🔍 Tiene propiedad 'pagination': ${'pagination' in apiResponse}`);
    console.log(`   🔍 Tipo de 'data': ${typeof apiResponse.data}`);
    console.log(`   🔍 Tipo de 'pagination': ${typeof apiResponse.pagination}`);
    console.log(`   🔍 'data' es array: ${Array.isArray(apiResponse.data)}`);
    console.log(`   🔍 Longitud de 'data': ${apiResponse.data.length}`);

    // Verificar estructura de paginación
    console.log('\n5. Estructura de paginación:');
    const pagination = apiResponse.pagination;
    console.log(`   🔍 currentPage: ${pagination.currentPage} (${typeof pagination.currentPage})`);
    console.log(`   🔍 totalPages: ${pagination.totalPages} (${typeof pagination.totalPages})`);
    console.log(`   🔍 totalRecords: ${pagination.totalRecords} (${typeof pagination.totalRecords})`);
    console.log(`   🔍 limit: ${pagination.limit} (${typeof pagination.limit})`);
    console.log(`   🔍 hasNextPage: ${pagination.hasNextPage} (${typeof pagination.hasNextPage})`);
    console.log(`   🔍 hasPrevPage: ${pagination.hasPrevPage} (${typeof pagination.hasPrevPage})`);

    // Verificar que la estructura es correcta para el frontend
    console.log('\n6. Verificando compatibilidad con frontend:');
    
    const hasData = apiResponse.data && Array.isArray(apiResponse.data);
    const hasPagination = apiResponse.pagination && typeof apiResponse.pagination === 'object';
    const hasRequiredFields = hasPagination && 
      'currentPage' in apiResponse.pagination &&
      'totalPages' in apiResponse.pagination &&
      'totalRecords' in apiResponse.pagination;
    
    console.log(`   🔍 Tiene data: ${hasData}`);
    console.log(`   🔍 Tiene paginación: ${hasPagination}`);
    console.log(`   🔍 Tiene campos requeridos: ${hasRequiredFields}`);
    
    if (hasData && hasPagination && hasRequiredFields) {
      console.log('   ✅ Estructura correcta para el frontend');
    } else {
      console.log('   ❌ Estructura incorrecta para el frontend');
    }

    // Simular la lógica del frontend
    console.log('\n7. Simulando lógica del frontend:');
    
    const contribuyentesRes = apiResponse;
    const frontendHasPagination = contribuyentesRes.data && contribuyentesRes.pagination;
    
    console.log(`   🔍 Frontend detecta paginación: ${frontendHasPagination}`);
    
    if (frontendHasPagination) {
      const frontendTotalRecords = contribuyentesRes.pagination.totalRecords;
      const frontendTotalPages = contribuyentesRes.pagination.totalPages;
      const frontendCondition = !false && frontendTotalRecords > 0 && frontendTotalPages > 1;
      
      console.log(`   🔍 Frontend totalRecords: ${frontendTotalRecords}`);
      console.log(`   🔍 Frontend totalPages: ${frontendTotalPages}`);
      console.log(`   🔍 Frontend condición: ${frontendCondition}`);
      console.log(`   🔍 Frontend debería mostrar: ${frontendTotalRecords > 0 && frontendTotalPages > 1}`);
    }

    // Mostrar respuesta completa para debugging
    console.log('\n8. Respuesta completa del API:');
    console.log(JSON.stringify(apiResponse, null, 2));

    console.log('\n✅ Verificación de estructura completada!');

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

testApiResponseStructure(); 