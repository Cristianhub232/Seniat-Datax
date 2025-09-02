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

async function testExcelStructureDebug() {
  let connection;
  
  try {
    console.log('🔍 Debuggeando estructura de resultados de Sequelize...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Simular un usuario ejecutivo
    const ejecutivoUserId = '3D5F0C5E9BF10228E063AC102049B2F9';
    const fechaInicio = '2025-08-01';
    const fechaFin = '2025-08-30';

    console.log('1. Ejecutando consulta de prueba...');
    
    const pagosQuery = `
      SELECT 
        cc.rif as "RIF",
        c.APELLIDO_CONTRIBUYENTE as "Apellido Contribuyente",
        mp.MONTO_TOTAL_PAGO as "Monto Total"
      FROM CGBRITO.CARTERA_CONTRIBUYENTES cc 
      LEFT JOIN DBO.MOVIMIENTO_PAGO mp ON mp.RIF_CONTRIBUYENTE_PAGO = cc.RIF
      LEFT JOIN DATOSCONTRIBUYENTE.CONTRIBUYENTE c ON cc.RIF = c.RIF_CONTRIBUYENTE
      WHERE mp.FECHA_RECAUDACION_PAGO IS NOT NULL
        AND mp.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
        AND mp.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
        AND cc.USUARIO_ID = :usuarioId
      ORDER BY mp.FECHA_RECAUDACION_PAGO DESC
      FETCH FIRST 5 ROWS ONLY
    `;
    
    const pagosResult = await connection.execute(pagosQuery, {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      usuarioId: ejecutivoUserId
    });
    
    console.log('2. Analizando estructura de resultados...');
    console.log('   Tipo de resultado:', typeof pagosResult);
    console.log('   Es array:', Array.isArray(pagosResult));
    console.log('   Propiedades:', Object.keys(pagosResult));
    
    if (pagosResult.rows) {
      console.log('   ✅ Tiene propiedad .rows');
      console.log('   Longitud de .rows:', pagosResult.rows.length);
      console.log('   Tipo de .rows:', typeof pagosResult.rows);
      console.log('   .rows es array:', Array.isArray(pagosResult.rows));
      
      if (pagosResult.rows.length > 0) {
        console.log('   Primera fila:', pagosResult.rows[0]);
        console.log('   Tipo primera fila:', typeof pagosResult.rows[0]);
        console.log('   Primera fila es array:', Array.isArray(pagosResult.rows[0]));
      }
    }
    
    if (pagosResult.metaData) {
      console.log('   ✅ Tiene propiedad .metaData');
      console.log('   MetaData:', pagosResult.metaData.map(m => m.name));
    }

    console.log('\n3. Simulando diferentes estructuras...');
    
    // Simular estructura que podría devolver Sequelize
    const mockSequelizeResult = [pagosResult.rows];
    console.log('   Mock Sequelize result:', {
      type: typeof mockSequelizeResult,
      isArray: Array.isArray(mockSequelizeResult),
      length: mockSequelizeResult.length,
      result0Type: typeof mockSequelizeResult[0],
      result0IsArray: Array.isArray(mockSequelizeResult[0]),
      result0Length: mockSequelizeResult[0]?.length
    });

    console.log('\n4. Probando extracción de array...');
    
    let pagosArray = [];
    if (Array.isArray(mockSequelizeResult)) {
      pagosArray = mockSequelizeResult;
      console.log('   ✅ Caso 1: result es array');
    } else if (Array.isArray(mockSequelizeResult[0])) {
      pagosArray = mockSequelizeResult[0];
      console.log('   ✅ Caso 2: result[0] es array');
    } else if (mockSequelizeResult && typeof mockSequelizeResult === 'object' && mockSequelizeResult.rows) {
      pagosArray = mockSequelizeResult.rows;
      console.log('   ✅ Caso 3: result.rows existe');
    } else {
      console.log('   ❌ No se pudo extraer array');
      pagosArray = [];
    }
    
    console.log('   Array extraído:', {
      length: pagosArray.length,
      isArray: Array.isArray(pagosArray),
      hasMap: typeof pagosArray.map === 'function'
    });

    console.log('\n5. Probando conversión a JSON...');
    if (pagosArray.length > 0 && typeof pagosArray.map === 'function') {
      const pagosJson = pagosArray.map(row => ({
        "RIF": row[0] || '',
        "Apellido Contribuyente": row[1] || '',
        "Monto Total": row[2] || 0
      }));
      
      console.log('   ✅ Conversión exitosa');
      console.log('   Objetos JSON:', pagosJson.length);
      if (pagosJson.length > 0) {
        console.log('   Primer objeto:', pagosJson[0]);
      }
    } else {
      console.log('   ❌ No se pudo convertir a JSON');
    }

    console.log('\n✅ Debug completado!');
    console.log('\n📋 Recomendación:');
    console.log('   - Usar result.rows directamente si está disponible');
    console.log('   - Verificar que result[0] sea un array si no hay .rows');
    console.log('   - Agregar validaciones para cada caso');

  } catch (error) {
    console.error('❌ Error en debug:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

testExcelStructureDebug(); 