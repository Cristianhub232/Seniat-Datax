const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.XMLS_DATABASE_URL,
});

async function debugVinculacion() {
  try {
    await client.connect();
    console.log('🔌 Conexión establecida correctamente');

    console.log('\n🔍 Debugging de la vinculación...');

    // 1. Verificar conceptos más recientes
    const conceptosRecientesQuery = `
      SELECT 
        id,
        id_planilla,
        cod_presupuestario,
        monto_concepto,
        "createdAt"
      FROM datalake.conceptos_2024
      ORDER BY "createdAt" DESC
      LIMIT 5
    `;
    
    const conceptosRecientesResult = await client.query(conceptosRecientesQuery);
    
    console.log('\n📋 Conceptos más recientes:');
    conceptosRecientesResult.rows.forEach((concepto, index) => {
      console.log(`   ${index + 1}. ID: ${concepto.id}, Planilla: ${concepto.id_planilla}, Código: ${concepto.cod_presupuestario}, Monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(concepto.monto_concepto)}, Fecha: ${concepto.createdAt}`);
    });

    // 2. Verificar planillas validadas más recientes
    const planillasRecientesQuery = `
      SELECT 
        id,
        rif_contribuyente,
        num_planilla,
        monto_total_trans,
        registro,
        "updatedat"
      FROM datalake.planillas_recaudacion_2024
      ORDER BY "updatedat" DESC
      LIMIT 5
    `;
    
    const planillasRecientesResult = await client.query(planillasRecientesQuery);
    
    console.log('\n📋 Planillas más recientemente actualizadas:');
    planillasRecientesResult.rows.forEach((planilla, index) => {
      console.log(`   ${index + 1}. ID: ${planilla.id}, RIF: ${planilla.rif_contribuyente}, Planilla: ${planilla.num_planilla}, Registro: ${planilla.registro}, Fecha: ${planilla.updatedat}`);
    });

    // 3. Verificar si hay planillas sin conceptos que deberían tener conceptos
    const planillasSinConceptosQuery = `
      SELECT 
        pr.id,
        pr.rif_contribuyente,
        pr.num_planilla,
        pr.monto_total_trans,
        pr.registro,
        COUNT(c.id) as conceptos_count
      FROM datalake.planillas_recaudacion_2024 pr
      LEFT JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla
      WHERE pr.registro = false
      GROUP BY pr.id, pr.rif_contribuyente, pr.num_planilla, pr.monto_total_trans, pr.registro
      HAVING COUNT(c.id) = 0
      ORDER BY pr.monto_total_trans DESC
      LIMIT 5
    `;
    
    const planillasSinConceptosResult = await client.query(planillasSinConceptosQuery);
    
    console.log('\n📋 Ejemplos de planillas sin conceptos:');
    planillasSinConceptosResult.rows.forEach((planilla, index) => {
      console.log(`   ${index + 1}. ID: ${planilla.id}, RIF: ${planilla.rif_contribuyente}, Planilla: ${planilla.num_planilla}, Monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(planilla.monto_total_trans)}, Conceptos: ${planilla.conceptos_count}`);
    });

    // 4. Verificar la vista materializada
    const mvQuery = `
      SELECT 
        COUNT(*) as total_mv,
        COUNT(DISTINCT codigo_forma) as formas_diferentes
      FROM datalake.planillas_sin_conceptos_mv
    `;
    
    const mvResult = await client.query(mvQuery);
    const mv = mvResult.rows[0];
    
    console.log('\n📋 Vista materializada:');
    console.log(`   - Total registros: ${parseInt(mv.total_mv).toLocaleString()}`);
    console.log(`   - Formas diferentes: ${parseInt(mv.formas_diferentes).toLocaleString()}`);

    // 5. Verificar permisos de la base de datos
    const permisosQuery = `
      SELECT 
        current_user as usuario_actual,
        current_database() as base_datos_actual,
        has_table_privilege('datalake.conceptos_2024', 'INSERT') as puede_insertar_conceptos,
        has_table_privilege('datalake.planillas_recaudacion_2024', 'UPDATE') as puede_actualizar_planillas
    `;
    
    const permisosResult = await client.query(permisosQuery);
    const permisos = permisosResult.rows[0];
    
    console.log('\n📋 Permisos de la base de datos:');
    console.log(`   - Usuario actual: ${permisos.usuario_actual}`);
    console.log(`   - Base de datos: ${permisos.base_datos_actual}`);
    console.log(`   - Puede insertar conceptos: ${permisos.puede_insertar_conceptos}`);
    console.log(`   - Puede actualizar planillas: ${permisos.puede_actualizar_planillas}`);

    console.log('\n🎉 Debug completado');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

debugVinculacion(); 