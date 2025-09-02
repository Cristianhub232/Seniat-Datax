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

async function checkAvatarColumn() {
  try {
    console.log('🔍 Verificando detalles del campo avatar...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar detalles del campo avatar
    console.log('2. Detalles del campo avatar:');
    const [columns] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'app' AND table_name = 'users' AND column_name = 'avatar'
    `);

    if (columns.length > 0) {
      const column = columns[0];
      console.log('   ✅ Columna avatar encontrada:');
      console.log(`     - Nombre: ${column.column_name}`);
      console.log(`     - Tipo: ${column.data_type}`);
      console.log(`     - Longitud máxima: ${column.character_maximum_length || 'Sin límite'}`);
      console.log(`     - Nullable: ${column.is_nullable}`);
      console.log(`     - Default: ${column.column_default || 'Sin default'}`);
      
      if (column.character_maximum_length) {
        console.log(`     - ⚠️  Límite de caracteres: ${column.character_maximum_length}`);
        console.log(`     - ⚠️  Una imagen base64 puede exceder este límite`);
      }
    } else {
      console.log('   ❌ Columna avatar no encontrada');
    }
    console.log('');

    // 3. Verificar tamaño de ejemplo de base64
    console.log('3. Tamaño de ejemplo de base64:');
    const sampleImageSize = 1024 * 1024; // 1MB
    const base64Size = Math.ceil(sampleImageSize * 4 / 3); // base64 es ~33% más grande
    console.log(`   - Imagen de 1MB en base64: ~${Math.round(base64Size / 1024)}KB`);
    console.log(`   - Imagen de 5MB en base64: ~${Math.round(base64Size * 5 / 1024)}KB`);
    console.log('');

    // 4. Soluciones recomendadas
    console.log('4. Soluciones recomendadas:');
    console.log('   🔧 Opción 1: Cambiar a TEXT (sin límite)');
    console.log('   🔧 Opción 2: Usar URLs externas (recomendado)');
    console.log('   🔧 Opción 3: Comprimir imágenes antes de base64');
    console.log('   🔧 Opción 4: Usar un servicio de almacenamiento');
    console.log('');

    // 5. Verificar si podemos modificar la columna
    console.log('5. Verificar permisos de modificación:');
    try {
      await sequelize.query('ALTER TABLE app.users ALTER COLUMN avatar TYPE TEXT');
      console.log('   ✅ Columna modificada exitosamente a TEXT');
      
      // Verificar el cambio
      const [newColumns] = await sequelize.query(`
        SELECT data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'app' AND table_name = 'users' AND column_name = 'avatar'
      `);
      
      if (newColumns.length > 0) {
        console.log(`   ✅ Nuevo tipo: ${newColumns[0].data_type}`);
        console.log(`   ✅ Longitud máxima: ${newColumns[0].character_maximum_length || 'Sin límite'}`);
      }
    } catch (error) {
      console.log('   ❌ Error modificando columna:', error.message);
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
checkAvatarColumn(); 