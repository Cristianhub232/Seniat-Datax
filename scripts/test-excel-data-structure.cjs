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

async function testExcelDataStructure() {
  let connection;
  
  try {
    console.log('🔍 Analizando estructura exacta de datos para Excel...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Simular un usuario ejecutivo
    const ejecutivoUserId = '3D5F0C5E9BF10228E063AC102049B2F9';
    const fechaInicio = '2025-08-01';
    const fechaFin = '2025-08-30';

    console.log('1. Ejecutando consulta completa...');
    
    const pagosQuery = `
      SELECT 
        cc.rif as "RIF",
        c.APELLIDO_CONTRIBUYENTE as "Apellido Contribuyente",
        mp.MONTO_TOTAL_PAGO as "Monto Total",
        mp.TIPO_DOCUMENTO_PAGO as "Tipo Documento",
        mp.FECHA_RECAUDACION_PAGO as "Fecha Recaudación",
        mp.NUMERO_DOCUMENTO_PAGO as "Número Documento",
        mp.BANCO_PAGO as "Banco",
        mp.PERIODO_PAGO as "Período",
        d.NOMBRE_DEPENDENCIA as "Dependencia",
        tc.DESCRIPCION_TIPO_CONTRIBUYENTE as "Tipo Contribuyente",
        c.ID_CONTRIBUYENTE as "ID Contribuyente",
        b.NOMBRE_BANCO as "Nombre Banco",
        f.DESCRIPCION_FORMULARIO as "Formulario"
      FROM CGBRITO.CARTERA_CONTRIBUYENTES cc 
      LEFT JOIN DBO.MOVIMIENTO_PAGO mp ON mp.RIF_CONTRIBUYENTE_PAGO = cc.RIF
      LEFT JOIN DATOSCONTRIBUYENTE.CONTRIBUYENTE c ON cc.RIF = c.RIF_CONTRIBUYENTE
      LEFT JOIN DATOSCONTRIBUYENTE.DEPENDENCIA d ON mp.DEPENDENCIA_SECTOR_PAGO = d.CODIGO_DEPENDENCIA
      LEFT JOIN DATOSCONTRIBUYENTE.TIPO_CONTRIBUYENTE tc ON c.TIPO_CONTRIBUYENTE = tc.CODIGO_TIPO_CONTRIBUYENTE
      LEFT JOIN dbo.BANCO b ON mp.BANCO_PAGO = b.CODIGO_BANCO
      LEFT JOIN dbo.FORMULARIO f ON mp.TIPO_DOCUMENTO_PAGO = f.CODIGO_FORMULARIO
      WHERE mp.FECHA_RECAUDACION_PAGO IS NOT NULL
        AND mp.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
        AND mp.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
        AND cc.USUARIO_ID = :usuarioId
      ORDER BY mp.FECHA_RECAUDACION_PAGO DESC
      FETCH FIRST 3 ROWS ONLY
    `;
    
    const pagosResult = await connection.execute(pagosQuery, {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      usuarioId: ejecutivoUserId
    });
    
    console.log('2. Analizando estructura de resultados...');
    console.log('   Tipo de resultado:', typeof pagosResult);
    console.log('   Propiedades:', Object.keys(pagosResult));
    console.log('   Tiene .rows:', !!pagosResult.rows);
    console.log('   Tiene .metaData:', !!pagosResult.metaData);
    
    if (pagosResult.rows) {
      console.log('   Longitud de .rows:', pagosResult.rows.length);
      console.log('   Tipo de .rows:', typeof pagosResult.rows);
      console.log('   .rows es array:', Array.isArray(pagosResult.rows));
      
      if (pagosResult.rows.length > 0) {
        console.log('\n3. Analizando primera fila...');
        const firstRow = pagosResult.rows[0];
        console.log('   Tipo primera fila:', typeof firstRow);
        console.log('   Es array:', Array.isArray(firstRow));
        console.log('   Longitud:', firstRow.length);
        console.log('   Contenido:', firstRow);
        
        console.log('\n4. Analizando segunda fila...');
        if (pagosResult.rows.length > 1) {
          const secondRow = pagosResult.rows[1];
          console.log('   Contenido:', secondRow);
        }
      }
    }
    
    if (pagosResult.metaData) {
      console.log('\n5. MetaData de columnas:');
      pagosResult.metaData.forEach((meta, index) => {
        console.log(`   ${index}: ${meta.name} (${meta.dbType})`);
      });
    }

    console.log('\n6. Simulando estructura que devuelve Sequelize...');
    
    // Simular lo que devuelve Sequelize
    const mockSequelizeResult = [pagosResult.rows];
    console.log('   Mock Sequelize result:', {
      type: typeof mockSequelizeResult,
      isArray: Array.isArray(mockSequelizeResult),
      length: mockSequelizeResult.length
    });
    
    console.log('   Mock result[0]:', {
      type: typeof mockSequelizeResult[0],
      isArray: Array.isArray(mockSequelizeResult[0]),
      length: mockSequelizeResult[0]?.length
    });

    console.log('\n7. Probando extracción de array...');
    
    let pagosArray = [];
    if (Array.isArray(mockSequelizeResult) && mockSequelizeResult.length > 0 && mockSequelizeResult[0] && typeof mockSequelizeResult[0] === 'object' && mockSequelizeResult[0].rows) {
      pagosArray = mockSequelizeResult[0].rows;
      console.log('   ✅ Caso: Sequelize envuelto en array con .rows');
    } else if (mockSequelizeResult && typeof mockSequelizeResult === 'object' && mockSequelizeResult.rows) {
      pagosArray = mockSequelizeResult.rows;
      console.log('   ✅ Caso: Resultado directo de Oracle con .rows');
    } else if (Array.isArray(mockSequelizeResult)) {
      pagosArray = mockSequelizeResult;
      console.log('   ✅ Caso: Array directo');
    } else {
      console.log('   ❌ No se pudo extraer array de resultados');
      pagosArray = [];
    }
    
    console.log('   Array extraído:', {
      length: pagosArray.length,
      isArray: Array.isArray(pagosArray),
      hasMap: typeof pagosArray.map === 'function'
    });

    console.log('\n8. Probando conversión a JSON...');
    if (pagosArray.length > 0 && Array.isArray(pagosArray[0])) {
      const pagosJson = pagosArray.map(row => ({
        "RIF": row[0] || '',
        "Apellido Contribuyente": row[1] || '',
        "Monto Total": row[2] || 0,
        "Tipo Documento": row[3] || '',
        "Fecha Recaudación": row[4] ? new Date(row[4]).toLocaleDateString('es-ES') : '',
        "Número Documento": row[5] || '',
        "Banco": row[6] || '',
        "Período": row[7] || '',
        "Dependencia": row[8] || '',
        "Tipo Contribuyente": row[9] || '',
        "ID Contribuyente": row[10] || '',
        "Nombre Banco": row[11] || '',
        "Formulario": row[12] || '',
        "Estado RIF": row[10] ? 'Válido' : 'Inválido'
      }));
      
      console.log('   ✅ Conversión exitosa');
      console.log('   Objetos JSON:', pagosJson.length);
      if (pagosJson.length > 0) {
        console.log('   Primer objeto:', pagosJson[0]);
      }
    } else {
      console.log('   ❌ No se pudo convertir a JSON');
    }

    console.log('\n✅ Análisis completado!');
    console.log('\n📋 Recomendación para el API:');
    console.log('   - Usar result[0].rows para extraer los datos');
    console.log('   - Cada fila es un array con 13 elementos');
    console.log('   - Mapear por índice según el orden de la consulta');

  } catch (error) {
    console.error('❌ Error en análisis:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

testExcelDataStructure(); 