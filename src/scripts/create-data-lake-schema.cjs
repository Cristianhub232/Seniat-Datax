const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos XMLS
const xmlsSequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function createDataLakeSchema() {
  try {
    console.log('🔍 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Crear el esquema data_lake si no existe
    console.log('\n📋 Creando esquema data_lake...');
    await xmlsSequelize.query('CREATE SCHEMA IF NOT EXISTS data_lake');
    console.log('✅ Esquema data_lake creado/verificado');

    // Crear la tabla conceptos_2024
    console.log('\n📋 Creando tabla conceptos_2024...');
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
    console.log('✅ Tabla conceptos_2024 creada correctamente');

    // Insertar datos de ejemplo
    console.log('\n📝 Insertando datos de ejemplo...');
    await xmlsSequelize.query(`
      INSERT INTO data_lake.conceptos_2024 
      (codigo_presupuestario, concepto, monto, fecha_registro, tipo_operacion, mes, anio) 
      VALUES 
      ('001-001-001', 'Concepto de prueba 1', 10000.00, '2024-01-15', 'INGRESO', 1, 2024),
      ('001-001-001', 'Concepto de prueba 2', 15000.00, '2024-01-20', 'INGRESO', 1, 2024),
      ('001-001-002', 'Concepto de prueba 3', 20000.00, '2024-02-10', 'EGRESO', 2, 2024),
      ('001-001-002', 'Concepto de prueba 4', 25000.00, '2024-02-15', 'EGRESO', 2, 2024),
      ('001-001-003', 'Concepto de prueba 5', 30000.00, '2024-03-05', 'INGRESO', 3, 2024),
      ('001-001-003', 'Concepto de prueba 6', 35000.00, '2024-03-10', 'INGRESO', 3, 2024),
      ('001-001-004', 'Concepto de prueba 7', 40000.00, '2024-04-01', 'EGRESO', 4, 2024),
      ('001-001-004', 'Concepto de prueba 8', 45000.00, '2024-04-15', 'EGRESO', 4, 2024)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Datos de ejemplo insertados');

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

    console.log('\n✅ Configuración completada exitosamente');
    console.log('🚀 El módulo de Reportes de Cierre está listo para usar');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

createDataLakeSchema(); 