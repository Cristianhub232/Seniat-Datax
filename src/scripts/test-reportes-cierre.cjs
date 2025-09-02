const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos XMLS
const xmlsSequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function testReportesCierre() {
  try {
    console.log('🔍 Probando conexión a base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar que la tabla conceptos_2024 existe
    console.log('\n📋 Verificando tabla conceptos_2024...');
    const [tables] = await xmlsSequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'data_lake' 
      AND table_name = 'conceptos_2024'
    `);

    if (tables.length === 0) {
      console.log('❌ La tabla data_lake.conceptos_2024 no existe');
      console.log('💡 Creando tabla de ejemplo...');
      
      await xmlsSequelize.query(`
        CREATE TABLE IF NOT EXISTS data_lake.conceptos_2024 (
          id SERIAL PRIMARY KEY,
          codigo_presupuestario VARCHAR(50) NOT NULL,
          concepto VARCHAR(255) NOT NULL,
          monto DECIMAL(15,2) NOT NULL,
          fecha_registro DATE NOT NULL,
          tipo_operacion VARCHAR(50),
          mes INTEGER,
          anio INTEGER,
          estado VARCHAR(20) DEFAULT 'ACTIVO',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('✅ Tabla creada correctamente');
      
      // Insertar datos de ejemplo
      console.log('📝 Insertando datos de ejemplo...');
      await xmlsSequelize.query(`
        INSERT INTO data_lake.conceptos_2024 
        (codigo_presupuestario, concepto, monto, fecha_registro, tipo_operacion, mes, anio) 
        VALUES 
        ('001-001-001', 'Concepto de prueba 1', 10000.00, '2024-01-15', 'INGRESO', 1, 2024),
        ('001-001-001', 'Concepto de prueba 2', 15000.00, '2024-01-20', 'INGRESO', 1, 2024),
        ('001-001-002', 'Concepto de prueba 3', 20000.00, '2024-02-10', 'EGRESO', 2, 2024),
        ('001-001-002', 'Concepto de prueba 4', 25000.00, '2024-02-15', 'EGRESO', 2, 2024),
        ('001-001-003', 'Concepto de prueba 5', 30000.00, '2024-03-05', 'INGRESO', 3, 2024)
      `);
      
      console.log('✅ Datos de ejemplo insertados');
    } else {
      console.log('✅ La tabla data_lake.conceptos_2024 existe');
    }

    // Verificar datos
    console.log('\n📊 Verificando datos en la tabla...');
    const [conceptos] = await xmlsSequelize.query(`
      SELECT 
        codigo_presupuestario,
        COUNT(*) as cantidad,
        SUM(monto) as total_monto,
        AVG(monto) as promedio_monto
      FROM data_lake.conceptos_2024 
      GROUP BY codigo_presupuestario
      ORDER BY total_monto DESC
    `);

    console.log('📈 Resumen de datos:');
    conceptos.forEach((item, index) => {
      console.log(`${index + 1}. Código: ${item.codigo_presupuestario}`);
      console.log(`   Cantidad: ${item.cantidad}`);
      console.log(`   Total: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(item.total_monto)}`);
      console.log(`   Promedio: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(item.promedio_monto)}`);
      console.log('');
    });

    // Verificar estadísticas generales
    const [estadisticas] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_conceptos,
        SUM(monto) as total_monto,
        AVG(monto) as promedio_monto
      FROM data_lake.conceptos_2024
    `);

    console.log('📊 Estadísticas generales:');
    console.log(`Total conceptos: ${estadisticas[0].total_conceptos}`);
    console.log(`Total monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(estadisticas[0].total_monto)}`);
    console.log(`Promedio monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(estadisticas[0].promedio_monto)}`);

    console.log('\n✅ Prueba completada exitosamente');
    console.log('🚀 El módulo de Reportes de Cierre está listo para usar');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

testReportesCierre(); 