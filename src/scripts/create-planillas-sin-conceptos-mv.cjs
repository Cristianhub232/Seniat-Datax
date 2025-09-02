const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.XMLS_DATABASE_URL,
});

async function createPlanillasSinConceptosMV() {
  try {
    await client.connect();
    console.log('🔌 Conexión establecida correctamente');

    // Crear la vista materializada
    const createMVQuery = `
      CREATE MATERIALIZED VIEW IF NOT EXISTS datalake.planillas_sin_conceptos_mv AS
      SELECT 
        pr.id,
        pr.rif_contribuyente,
        pr.num_planilla,
        pr.monto_total_trans,
        f.codigo_forma,
        f.nombre_forma,
        pr.id as planilla_id,
        pr.fecha_trans
      FROM datalake.planillas_recaudacion_2024 pr
      LEFT JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla 
      INNER JOIN public.formas f ON pr.cod_forma = f.id
      WHERE pr.registro = false AND c.id IS NULL
      ORDER BY pr.monto_total_trans DESC
    `;

    console.log('📊 Creando vista materializada...');
    await client.query(createMVQuery);
    console.log('✅ Vista materializada creada exitosamente');

    // Crear índices para mejorar el rendimiento
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_planillas_sin_conceptos_codigo_forma ON datalake.planillas_sin_conceptos_mv(codigo_forma)',
      'CREATE INDEX IF NOT EXISTS idx_planillas_sin_conceptos_planilla_id ON datalake.planillas_sin_conceptos_mv(planilla_id)',
      'CREATE INDEX IF NOT EXISTS idx_planillas_sin_conceptos_monto ON datalake.planillas_sin_conceptos_mv(monto_total_trans DESC)',
      'CREATE INDEX IF NOT EXISTS idx_planillas_sin_conceptos_fecha ON datalake.planillas_sin_conceptos_mv(fecha_trans DESC)'
    ];

    console.log('🔍 Creando índices...');
    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Índices creados exitosamente');

    // Verificar datos
    const countQuery = 'SELECT COUNT(*) as total FROM datalake.planillas_sin_conceptos_mv';
    const countResult = await client.query(countQuery);
    console.log(`📈 Total de planillas sin conceptos: ${countResult.rows[0].total}`);

    // Mostrar algunas estadísticas por forma
    const statsQuery = `
      SELECT 
        codigo_forma,
        nombre_forma,
        COUNT(*) as cantidad_planillas,
        SUM(monto_total_trans) as monto_total
      FROM datalake.planillas_sin_conceptos_mv
      GROUP BY codigo_forma, nombre_forma
      ORDER BY monto_total DESC
      LIMIT 10
    `;
    
    const statsResult = await client.query(statsQuery);
    console.log('\n📊 Top 10 formas con planillas sin conceptos:');
    statsResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.nombre_forma} (${row.codigo_forma})`);
      console.log(`   Planillas: ${row.cantidad_planillas}, Monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(row.monto_total)}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createPlanillasSinConceptosMV(); 