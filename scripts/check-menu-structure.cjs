const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const config = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

const sequelize = new Sequelize(config);

async function checkMenuStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla de menús...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar estructura de la tabla
    console.log('2. Verificando estructura de la tabla app.menus...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'app' AND table_name = 'menus'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columnas de la tabla app.menus:');
    columns.forEach((column, index) => {
      console.log(`   ${index + 1}. ${column.column_name} (${column.data_type}) - Nullable: ${column.is_nullable}`);
    });

    // 3. Verificar algunos registros de ejemplo
    console.log('\n3. Verificando registros de ejemplo...');
    const [sampleMenus] = await sequelize.query(`
      SELECT * FROM app.menus LIMIT 3
    `);

    if (sampleMenus.length > 0) {
      console.log('📋 Registros de ejemplo:');
      sampleMenus.forEach((menu, index) => {
        console.log(`   ${index + 1}. ${JSON.stringify(menu, null, 2)}`);
      });
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
checkMenuStructure(); 