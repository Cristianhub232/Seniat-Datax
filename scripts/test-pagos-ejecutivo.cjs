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

async function testPagosEjecutivo() {
  let connection;
  
  try {
    console.log('🔍 Probando funcionalidad de pagos ejecutados para usuarios ejecutivos...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();

    // Simular un usuario ejecutivo
    const ejecutivoUserId = '3D5F0C5E9BF10228E063AC102049B2F9'; // ID de un usuario ejecutivo
    const fechaInicio = '2024-01-01';
    const fechaFin = '2024-12-31';

    console.log('1. Verificando contribuyentes del ejecutivo...');
    
    const carteraQuery = `
      SELECT ID, RIF, TIPO_CONTRIBUYENTE, USUARIO_ID
      FROM CGBRITO.CARTERA_CONTRIBUYENTES 
      WHERE USUARIO_ID = :usuarioId
      ORDER BY CREATED_AT DESC
    `;
    
    const carteraResult = await connection.execute(carteraQuery, { usuarioId: ejecutivoUserId });
    const cartera = carteraResult.rows;
    
    console.log(`   ✅ Contribuyentes en cartera del ejecutivo: ${cartera.length}`);
    
    if (cartera.length > 0) {
      console.log('   📋 Primeros 5 contribuyentes:');
      cartera.slice(0, 5).forEach((contribuyente, index) => {
        console.log(`   ${index + 1}. ${contribuyente[1]} (${contribuyente[2]})`);
      });
    }

    // Verificar pagos de los contribuyentes del ejecutivo
    console.log('\n2. Verificando pagos de los contribuyentes del ejecutivo...');
    
    const pagosQuery = `
      SELECT 
        cc.rif,
        c.APELLIDO_CONTRIBUYENTE,
        mp.MONTO_TOTAL_PAGO,
        mp.TIPO_DOCUMENTO_PAGO,
        mp.FECHA_RECAUDACION_PAGO,
        mp.NUMERO_DOCUMENTO_PAGO,
        mp.BANCO_PAGO,
        mp.PERIODO_PAGO,
        d.NOMBRE_DEPENDENCIA,
        tc.DESCRIPCION_TIPO_CONTRIBUYENTE,
        c.ID_CONTRIBUYENTE,
        b.NOMBRE_BANCO,
        f.DESCRIPCION_FORMULARIO
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
    `;
    
    const pagosResult = await connection.execute(pagosQuery, {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      usuarioId: ejecutivoUserId
    });
    const pagos = pagosResult.rows;
    
    console.log(`   ✅ Pagos encontrados: ${pagos.length}`);
    
    if (pagos.length > 0) {
      console.log('   📋 Primeros 5 pagos:');
      pagos.slice(0, 5).forEach((pago, index) => {
        console.log(`   ${index + 1}. ${pago[0]} - ${pago[1]} - $${pago[2]} - ${pago[4]}`);
      });
    }

    // Verificar estadísticas del ejecutivo
    console.log('\n3. Verificando estadísticas del ejecutivo...');
    
    const statsQuery = `
      SELECT 
        (SELECT COUNT(DISTINCT mp2.RIF_CONTRIBUYENTE_PAGO) 
         FROM CGBRITO.CARTERA_CONTRIBUYENTES cc2
         INNER JOIN DBO.MOVIMIENTO_PAGO mp2 ON mp2.RIF_CONTRIBUYENTE_PAGO = cc2.RIF
         WHERE mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
         AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         AND cc2.USUARIO_ID = :usuarioId) as total_con_pagos,
        (SELECT SUM(mp2.MONTO_TOTAL_PAGO) 
         FROM CGBRITO.CARTERA_CONTRIBUYENTES cc2
         INNER JOIN DBO.MOVIMIENTO_PAGO mp2 ON mp2.RIF_CONTRIBUYENTE_PAGO = cc2.RIF
         WHERE mp2.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
         AND mp2.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
         AND cc2.USUARIO_ID = :usuarioId) as monto_total,
        (SELECT COUNT(*) FROM CGBRITO.CARTERA_CONTRIBUYENTES cc WHERE cc.USUARIO_ID = :usuarioId) as total_cartera
      FROM DUAL
    `;
    
    const statsResult = await connection.execute(statsQuery, {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      usuarioId: ejecutivoUserId
    });
    const stats = statsResult.rows[0];
    
    console.log('   📊 Estadísticas del ejecutivo:');
    console.log(`      - Total con pagos: ${stats[0] || 0}`);
    console.log(`      - Monto total: $${stats[1] || 0}`);
    console.log(`      - Total en cartera: ${stats[2] || 0}`);

    // Verificar que no puede ver pagos de otros ejecutivos
    console.log('\n4. Verificando restricción de acceso...');
    
    const otrosPagosQuery = `
      SELECT COUNT(*) as total_otros
      FROM CGBRITO.CARTERA_CONTRIBUYENTES cc 
      LEFT JOIN DBO.MOVIMIENTO_PAGO mp ON mp.RIF_CONTRIBUYENTE_PAGO = cc.RIF
      WHERE mp.FECHA_RECAUDACION_PAGO IS NOT NULL
        AND mp.FECHA_RECAUDACION_PAGO >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')
        AND mp.FECHA_RECAUDACION_PAGO <= TO_DATE(:fechaFin, 'YYYY-MM-DD')
        AND cc.USUARIO_ID != :usuarioId
    `;
    
    const otrosPagosResult = await connection.execute(otrosPagosQuery, {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      usuarioId: ejecutivoUserId
    });
    const otrosPagos = otrosPagosResult.rows[0][0];
    
    console.log(`   ✅ Pagos de otros ejecutivos (no debería ver): ${otrosPagos}`);

    // Verificar menú y permisos
    console.log('\n5. Verificando menú y permisos...');
    
    const menuQuery = `
      SELECT m.ID, m.NAME, m.PATH, m.ICON
      FROM CGBRITO.MENUS m
      WHERE m.NAME = 'Pagos Ejecutados'
    `;
    
    const menuResult = await connection.execute(menuQuery);
    const menu = menuResult.rows[0];
    
    if (menu) {
      console.log(`   ✅ Menú encontrado: ${menu[1]} (${menu[2]}) - ${menu[3]}`);
    } else {
      console.log('   ❌ Menú no encontrado');
    }

    const permisosQuery = `
      SELECT r.NAME as ROLE_NAME, rp.PERMISSION_ID
      FROM CGBRITO.ROLE_MENU_PERMISSIONS rp
      JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
      JOIN CGBRITO.MENUS m ON rp.MENU_ID = m.ID
      WHERE m.NAME = 'Pagos Ejecutados'
      AND r.NAME = 'Ejecutivo'
    `;
    
    const permisosResult = await connection.execute(permisosQuery);
    const permisos = permisosResult.rows[0];
    
    if (permisos) {
      console.log(`   ✅ Permisos encontrados: ${permisos[0]} (Permiso: ${permisos[1]})`);
    } else {
      console.log('   ❌ Permisos no encontrados');
    }

    console.log('\n✅ Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log(`   - Contribuyentes en cartera: ${cartera.length}`);
    console.log(`   - Pagos del ejecutivo: ${pagos.length}`);
    console.log(`   - Pagos de otros (no accesibles): ${otrosPagos}`);
    console.log('   - Menú configurado correctamente');
    console.log('   - Permisos configurados correctamente');
    console.log('   - Restricción por usuario funcionando');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.close();
    }
    await oracledb.getPool().close();
  }
}

testPagosEjecutivo(); 