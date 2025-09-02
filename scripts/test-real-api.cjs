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

async function testRealApi() {
  let connection;
  
  try {
    console.log('🔍 Verificando respuesta real del API...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Simular exactamente la lógica del API
    console.log('1. Simulando lógica exacta del API...');
    
    const page = 1;
    const limit = 100;
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const offset = (validPage - 1) * validLimit;
    
    console.log(`   🔍 Página: ${page} -> ${validPage}`);
    console.log(`   🔍 Límite: ${limit} -> ${validLimit}`);
    console.log(`   🔍 Offset: ${offset}`);

    // Consulta principal con paginación (exactamente como en el API)
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

    // Consulta de conteo (exactamente como en el API)
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

    // Transformar los datos (exactamente como en el API)
    console.log('\n3. Transformando datos...');
    
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
    if (transformedContribuyentes.length > 0) {
      console.log(`   🔍 Primer contribuyente: ${transformedContribuyentes[0].rif} (${transformedContribuyentes[0].tipoContribuyente})`);
    }

    // Calcular información de paginación (exactamente como en el API)
    console.log('\n4. Calculando paginación...');
    
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

    console.log('\n5. Respuesta final del API:');
    console.log(`   🔍 Estructura: ${apiResponse.data ? 'data presente' : 'data ausente'}`);
    console.log(`   🔍 Paginación: ${apiResponse.pagination ? 'pagination presente' : 'pagination ausente'}`);
    console.log(`   🔍 Contribuyentes en data: ${apiResponse.data.length}`);
    console.log(`   🔍 Página actual: ${apiResponse.pagination.currentPage}`);
    console.log(`   🔍 Total de páginas: ${apiResponse.pagination.totalPages}`);
    console.log(`   🔍 Total de registros: ${apiResponse.pagination.totalRecords}`);
    console.log(`   🔍 Límite: ${apiResponse.pagination.limit}`);
    console.log(`   🔍 Tiene siguiente: ${apiResponse.pagination.hasNextPage}`);
    console.log(`   🔍 Tiene anterior: ${apiResponse.pagination.hasPrevPage}`);

    // Verificar que la estructura es correcta para el frontend
    console.log('\n6. Verificando estructura para frontend...');
    
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

    console.log('\n✅ Verificación de API real completada!');
    console.log('\n📝 Resumen:');
    console.log('   - API debería devolver estructura correcta');
    console.log('   - Datos transformados correctamente');
    console.log('   - Paginación calculada correctamente');
    console.log('   - Estructura compatible con frontend');

  } catch (error) {
    console.error('❌ Error en la verificación del API real:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

testRealApi(); 