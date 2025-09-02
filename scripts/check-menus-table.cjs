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

async function checkMenusTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla menus...\n');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Verificar estructura de la tabla
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'app' AND table_name = 'menus'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estructura de la tabla app.menus:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });

    // Verificar datos existentes
    const [menus] = await sequelize.query(`
      SELECT * FROM app.menus LIMIT 5
    `);

    console.log('\n📊 Datos existentes (primeros 5):');
    if (menus.length > 0) {
      console.log('Columnas disponibles:', Object.keys(menus[0]));
      menus.forEach((menu, index) => {
        console.log(`   ${index + 1}.`, menu);
      });
    } else {
      console.log('   No hay datos en la tabla');
    }

  } catch (error) {
    console.error('❌ Error verificando tabla menus:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
checkMenusTable(); 