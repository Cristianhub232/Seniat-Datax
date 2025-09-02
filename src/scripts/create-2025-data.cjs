const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos XMLS
const xmlsSequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function create2025Data() {
  try {
    console.log('🔍 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Insertar datos de ejemplo para 2025
    console.log('\n📝 Insertando datos de ejemplo para 2025...');
    await xmlsSequelize.query(`
      INSERT INTO data_lake.conceptos_2024 
      (codigo_presupuestario, concepto, monto, fecha_registro, tipo_operacion, mes, anio) 
      VALUES 
      ('001-001-001', 'Concepto 2025 - Ingreso 1', 12000.00, '2025-01-10', 'INGRESO', 1, 2025),
      ('001-001-001', 'Concepto 2025 - Ingreso 2', 18000.00, '2025-01-25', 'INGRESO', 1, 2025),
      ('001-001-002', 'Concepto 2025 - Egreso 1', 22000.00, '2025-02-05', 'EGRESO', 2, 2025),
      ('001-001-002', 'Concepto 2025 - Egreso 2', 28000.00, '2025-02-20', 'EGRESO', 2, 2025),
      ('001-001-003', 'Concepto 2025 - Ingreso 3', 32000.00, '2025-03-08', 'INGRESO', 3, 2025),
      ('001-001-003', 'Concepto 2025 - Ingreso 4', 38000.00, '2025-03-15', 'INGRESO', 3, 2025),
      ('001-001-004', 'Concepto 2025 - Egreso 3', 42000.00, '2025-04-03', 'EGRESO', 4, 2025),
      ('001-001-004', 'Concepto 2025 - Egreso 4', 48000.00, '2025-04-18', 'EGRESO', 4, 2025),
      ('001-001-005', 'Concepto 2025 - Nuevo Código', 55000.00, '2025-05-01', 'INGRESO', 5, 2025),
      ('001-001-005', 'Concepto 2025 - Nuevo Código 2', 62000.00, '2025-05-15', 'INGRESO', 5, 2025)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Datos de ejemplo para 2025 insertados');

    // Verificar datos de 2025
    console.log('\n📊 Verificando datos de 2025...');
    const [conceptos2025] = await xmlsSequelize.query(`
      SELECT 
        codigo_presupuestario,
        COUNT(*) as cantidad,
        SUM(monto) as total_monto,
        AVG(monto) as promedio_monto
      FROM data_lake.conceptos_2024 
      WHERE anio = 2025
      GROUP BY codigo_presupuestario
      ORDER BY total_monto DESC
    `);

    console.log('📈 Resumen de datos 2025:');
    conceptos2025.forEach((item, index) => {
      console.log(`${index + 1}. Código: ${item.codigo_presupuestario}`);
      console.log(`   Cantidad: ${item.cantidad}`);
      console.log(`   Total: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(item.total_monto)}`);
      console.log(`   Promedio: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(item.promedio_monto)}`);
      console.log('');
    });

    // Verificar estadísticas generales de 2025
    const [estadisticas2025] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_conceptos,
        SUM(monto) as total_monto,
        AVG(monto) as promedio_monto
      FROM data_lake.conceptos_2024
      WHERE anio = 2025
    `);

    console.log('📊 Estadísticas generales 2025:');
    console.log(`Total conceptos: ${estadisticas2025[0].total_conceptos}`);
    console.log(`Total monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(estadisticas2025[0].total_monto)}`);
    console.log(`Promedio monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(estadisticas2025[0].promedio_monto)}`);

    console.log('\n✅ Datos de 2025 creados exitosamente');
    console.log('🚀 Ahora puedes usar ambas pestañas: 2024 y 2025');

  } catch (error) {
    console.error('❌ Error durante la creación de datos 2025:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

create2025Data(); 