const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos XMLS
const xmlsSequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function verifyRealStructure() {
  try {
    console.log('🔍 Verificando estructura real de las tablas...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar si las tablas existen
    console.log('\n📋 Verificando existencia de tablas...');
    
    const [tables] = await xmlsSequelize.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema IN ('datalake', 'public') 
      AND table_name IN ('planillas_recaudacion_2024', 'conceptos_2024', 'codigos_presupuestarios')
      ORDER BY table_schema, table_name
    `);

    console.log('📊 Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_schema}.${table.table_name}`);
    });

    // Verificar estructura de planillas_recaudacion_2024
    console.log('\n📋 Verificando estructura de planillas_recaudacion_2024...');
    const [planillasColumns] = await xmlsSequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'datalake' 
      AND table_name = 'planillas_recaudacion_2024'
      ORDER BY ordinal_position
    `);

    console.log('📊 Columnas de planillas_recaudacion_2024:');
    planillasColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar estructura de conceptos_2024
    console.log('\n📋 Verificando estructura de conceptos_2024...');
    const [conceptosColumns] = await xmlsSequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'datalake' 
      AND table_name = 'conceptos_2024'
      ORDER BY ordinal_position
    `);

    console.log('📊 Columnas de conceptos_2024:');
    conceptosColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar estructura de codigos_presupuestarios
    console.log('\n📋 Verificando estructura de codigos_presupuestarios...');
    const [codigosColumns] = await xmlsSequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'codigos_presupuestarios'
      ORDER BY ordinal_position
    `);

    console.log('📊 Columnas de codigos_presupuestarios:');
    codigosColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar datos existentes
    console.log('\n📊 Verificando datos existentes...');
    
    const [planillasCount] = await xmlsSequelize.query(`
      SELECT COUNT(*) as count FROM datalake.planillas_recaudacion_2024 WHERE registro = true
    `);
    console.log(`   - Planillas con registro=true: ${planillasCount[0].count}`);

    const [conceptosCount] = await xmlsSequelize.query(`
      SELECT COUNT(*) as count FROM datalake.conceptos_2024
    `);
    console.log(`   - Conceptos totales: ${conceptosCount[0].count}`);

    const [codigosCount] = await xmlsSequelize.query(`
      SELECT COUNT(*) as count FROM public.codigos_presupuestarios
    `);
    console.log(`   - Códigos presupuestarios: ${codigosCount[0].count}`);

    // Probar la consulta real
    console.log('\n🔍 Probando consulta real...');
    const [testQuery] = await xmlsSequelize.query(`
      SELECT 
        pr.monto_total_trans,
        pr.id,
        c.cod_presupuestario,
        c.monto_concepto,
        cp.codigo_presupuestario,
        cp.designacion_presupuestario
      FROM datalake.planillas_recaudacion_2024 pr 
      INNER JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla
      INNER JOIN public.codigos_presupuestarios cp ON cp.id = c.cod_presupuestario 
      WHERE pr.registro = true
      LIMIT 5
    `);

    console.log('📊 Resultado de consulta de prueba:');
    testQuery.forEach((row, index) => {
      console.log(`   ${index + 1}. Planilla ID: ${row.id}, Código: ${row.codigo_presupuestario}, Monto: ${row.monto_concepto}`);
    });

    console.log('\n✅ Verificación completada');
    console.log('🚀 La estructura está lista para usar con la nueva lógica');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

verifyRealStructure(); 