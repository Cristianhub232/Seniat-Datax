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

async function updateUserFields() {
  try {
    console.log('🔧 Actualizando campos del modelo de usuario...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Agregar campos faltantes
    console.log('2. Agregando campos faltantes a la tabla users...');
    
    // Verificar si los campos ya existen
    const [existingColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'app' 
      AND table_name = 'users'
      AND column_name IN ('avatar', 'phone', 'location', 'bio')
    `);

    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('   Campos existentes:', existingColumnNames);

    // Agregar campos que no existen
    if (!existingColumnNames.includes('avatar')) {
      await sequelize.query(`
        ALTER TABLE app.users 
        ADD COLUMN avatar VARCHAR(255)
      `);
      console.log('   ✅ Campo "avatar" agregado');
    }

    if (!existingColumnNames.includes('phone')) {
      await sequelize.query(`
        ALTER TABLE app.users 
        ADD COLUMN phone VARCHAR(20)
      `);
      console.log('   ✅ Campo "phone" agregado');
    }

    if (!existingColumnNames.includes('location')) {
      await sequelize.query(`
        ALTER TABLE app.users 
        ADD COLUMN location VARCHAR(100)
      `);
      console.log('   ✅ Campo "location" agregado');
    }

    if (!existingColumnNames.includes('bio')) {
      await sequelize.query(`
        ALTER TABLE app.users 
        ADD COLUMN bio TEXT
      `);
      console.log('   ✅ Campo "bio" agregado');
    }

    console.log('✅ Campos actualizados\n');

    // 3. Verificar estructura final
    console.log('3. Verificando estructura final de la tabla users...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'app' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('   Estructura de la tabla users:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('\n🎉 ¡Campos del modelo de usuario actualizados exitosamente!');
    console.log('\n📝 Campos agregados:');
    console.log('   ✅ avatar (VARCHAR(255)) - Para URL de imagen de perfil');
    console.log('   ✅ phone (VARCHAR(20)) - Para número de teléfono');
    console.log('   ✅ location (VARCHAR(100)) - Para ubicación del usuario');
    console.log('   ✅ bio (TEXT) - Para biografía del usuario');

  } catch (error) {
    console.error('❌ Error actualizando campos:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar actualización
updateUserFields(); 