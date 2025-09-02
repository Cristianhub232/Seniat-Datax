const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.XMLS_DATABASE_URL,
});

async function testCreacionConceptos() {
  try {
    await client.connect();
    console.log('🔌 Conexión establecida correctamente');

    console.log('\n📊 Verificando vista materializada...');
    
    // Verificar que la vista materializada existe
    const mvExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'datalake' 
        AND table_name = 'planillas_sin_conceptos_mv'
      ) as exists;
    `;
    
    const mvExistsResult = await client.query(mvExistsQuery);
    if (mvExistsResult.rows[0].exists) {
      console.log('✅ Vista materializada existe');
    } else {
      console.log('❌ Vista materializada no existe');
      return;
    }

    // Verificar datos en la vista materializada
    const countQuery = 'SELECT COUNT(*) as total FROM datalake.planillas_sin_conceptos_mv';
    const countResult = await client.query(countQuery);
    console.log(`📈 Total de planillas sin conceptos: ${countResult.rows[0].total}`);

    // Verificar formas agrupadas
    const formasQuery = `
      SELECT 
        codigo_forma,
        nombre_forma,
        COUNT(*) as cantidad_planillas,
        SUM(monto_total_trans) as monto_total
      FROM datalake.planillas_sin_conceptos_mv
      GROUP BY codigo_forma, nombre_forma
      ORDER BY monto_total DESC
      LIMIT 5
    `;
    
    const formasResult = await client.query(formasQuery);
    console.log('\n📋 Top 5 formas con planillas sin conceptos:');
    formasResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.nombre_forma} (${row.codigo_forma})`);
      console.log(`   Planillas: ${row.cantidad_planillas}, Monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(row.monto_total)}`);
    });

    // Verificar códigos presupuestarios disponibles
    const codigosQuery = 'SELECT COUNT(*) as total FROM public.codigos_presupuestarios';
    const codigosResult = await client.query(codigosQuery);
    console.log(`\n📊 Códigos presupuestarios disponibles: ${codigosResult.rows[0].total}`);

    // Verificar algunas planillas de ejemplo
    const planillasQuery = `
      SELECT 
        rif_contribuyente,
        num_planilla,
        monto_total_trans,
        codigo_forma,
        nombre_forma
      FROM datalake.planillas_sin_conceptos_mv
      LIMIT 3
    `;
    
    const planillasResult = await client.query(planillasQuery);
    console.log('\n📋 Ejemplos de planillas sin conceptos:');
    planillasResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. RIF: ${row.rif_contribuyente}, Planilla: ${row.num_planilla}`);
      console.log(`   Forma: ${row.nombre_forma} (${row.codigo_forma})`);
      console.log(`   Monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(row.monto_total_trans)}`);
    });

    console.log('\n🎉 Verificación completada exitosamente');
    console.log('📝 El módulo "Creación de Conceptos" está listo para usar');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testCreacionConceptos(); 