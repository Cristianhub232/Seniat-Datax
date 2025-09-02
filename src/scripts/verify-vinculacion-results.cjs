const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.XMLS_DATABASE_URL,
});

async function verifyVinculacionResults() {
  try {
    await client.connect();
    console.log('🔌 Conexión establecida correctamente');

    console.log('\n📊 Verificando resultados de la vinculación...');

    // 1. Verificar conceptos creados recientemente
    const conceptosQuery = `
      SELECT 
        COUNT(*) as total_conceptos,
        COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '1 hour' THEN 1 END) as conceptos_recientes,
        SUM(monto_concepto) as monto_total_conceptos
      FROM datalake.conceptos_2024
    `;
    
    const conceptosResult = await client.query(conceptosQuery);
    const conceptos = conceptosResult.rows[0];
    
    console.log('\n📋 Conceptos en la base de datos:');
    console.log(`   - Total conceptos: ${parseInt(conceptos.total_conceptos).toLocaleString()}`);
    console.log(`   - Conceptos creados en la última hora: ${parseInt(conceptos.conceptos_recientes).toLocaleString()}`);
    console.log(`   - Monto total conceptos: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(conceptos.monto_total_conceptos)}`);

    // 2. Verificar planillas validadas recientemente
    const planillasQuery = `
      SELECT 
        COUNT(*) as total_planillas,
        COUNT(CASE WHEN registro = true THEN 1 END) as planillas_validadas,
        COUNT(CASE WHEN registro = false THEN 1 END) as planillas_no_validadas,
        COUNT(CASE WHEN registro = true AND "updatedat" >= NOW() - INTERVAL '1 hour' THEN 1 END) as planillas_validadas_recientes
      FROM datalake.planillas_recaudacion_2024
    `;
    
    const planillasResult = await client.query(planillasQuery);
    const planillas = planillasResult.rows[0];
    
    console.log('\n📋 Estado de las planillas:');
    console.log(`   - Total planillas: ${parseInt(planillas.total_planillas).toLocaleString()}`);
    console.log(`   - Planillas validadas: ${parseInt(planillas.planillas_validadas).toLocaleString()}`);
    console.log(`   - Planillas no validadas: ${parseInt(planillas.planillas_no_validadas).toLocaleString()}`);
    console.log(`   - Planillas validadas en la última hora: ${parseInt(planillas.planillas_validadas_recientes).toLocaleString()}`);

    // 3. Verificar planillas sin conceptos (debería haber disminuido)
    const planillasSinConceptosQuery = `
      SELECT COUNT(*) as total_sin_conceptos
      FROM datalake.planillas_sin_conceptos_mv
    `;
    
    const planillasSinConceptosResult = await client.query(planillasSinConceptosQuery);
    const planillasSinConceptos = planillasSinConceptosResult.rows[0];
    
    console.log('\n📋 Planillas sin conceptos:');
    console.log(`   - Total actual: ${parseInt(planillasSinConceptos.total_sin_conceptos).toLocaleString()}`);

    // 4. Verificar conceptos creados por código presupuestario
    const conceptosPorCodigoQuery = `
      SELECT 
        cp.codigo_presupuestario,
        cp.designacion_presupuestario,
        COUNT(c.id) as cantidad_conceptos,
        SUM(c.monto_concepto) as monto_total
      FROM datalake.conceptos_2024 c
      JOIN public.codigos_presupuestarios cp ON c.cod_presupuestario = cp.id
      WHERE c."createdAt" >= NOW() - INTERVAL '1 hour'
      GROUP BY cp.codigo_presupuestario, cp.designacion_presupuestario
      ORDER BY monto_total DESC
      LIMIT 10
    `;
    
    const conceptosPorCodigoResult = await client.query(conceptosPorCodigoQuery);
    
    console.log('\n📋 Conceptos creados por código presupuestario (última hora):');
    if (conceptosPorCodigoResult.rows.length > 0) {
      conceptosPorCodigoResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.codigo_presupuestario} - ${row.designacion_presupuestario}`);
        console.log(`      Conceptos: ${parseInt(row.cantidad_conceptos).toLocaleString()}, Monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(row.monto_total)}`);
      });
    } else {
      console.log('   No se encontraron conceptos creados en la última hora');
    }

    // 5. Verificar estadísticas generales
    const estadisticasQuery = `
      SELECT 
        (SELECT COUNT(*) FROM datalake.conceptos_2024) as total_conceptos,
        (SELECT COUNT(*) FROM datalake.planillas_recaudacion_2024 WHERE registro = true) as planillas_validadas,
        (SELECT COUNT(*) FROM datalake.planillas_recaudacion_2024 WHERE registro = false) as planillas_no_validadas,
        (SELECT COUNT(*) FROM datalake.planillas_sin_conceptos_mv) as planillas_sin_conceptos
    `;
    
    const estadisticasResult = await client.query(estadisticasQuery);
    const estadisticas = estadisticasResult.rows[0];
    
    console.log('\n📊 Estadísticas generales:');
    console.log(`   - Total conceptos: ${parseInt(estadisticas.total_conceptos).toLocaleString()}`);
    console.log(`   - Planillas validadas: ${parseInt(estadisticas.planillas_validadas).toLocaleString()}`);
    console.log(`   - Planillas no validadas: ${parseInt(estadisticas.planillas_no_validadas).toLocaleString()}`);
    console.log(`   - Planillas sin conceptos: ${parseInt(estadisticas.planillas_sin_conceptos).toLocaleString()}`);

    console.log('\n🎉 Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyVinculacionResults(); 