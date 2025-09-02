const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

async function testFormasConnection() {
  console.log('🔧 Probando conexión a la base de datos XMLS...');
  console.log('XMLS_DATABASE_URL:', process.env.XMLS_DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

  if (!process.env.XMLS_DATABASE_URL) {
    console.error('❌ XMLS_DATABASE_URL no está configurada');
    return;
  }

  const sequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
  });

  try {
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos XMLS establecida correctamente.');

    // Verificar si la tabla formas existe
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'formas'
    `);

    if (results.length > 0) {
      console.log('✅ Tabla formas encontrada');
      
      // Verificar estructura de la tabla
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'formas'
        ORDER BY ordinal_position
      `);

      console.log('📊 Estructura de la tabla formas:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });

      // Contar registros
      const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM public.formas');
      console.log(`📝 Total de formas: ${countResult[0].total}`);

      // Obtener algunos registros de ejemplo
      const [formas] = await sequelize.query(`
        SELECT id, numero, nombre_forma, tipo 
        FROM public.formas 
        ORDER BY numero 
        LIMIT 5
      `);

      console.log('🔍 Formas de ejemplo:');
      formas.forEach((forma, index) => {
        console.log(`  ${index + 1}. ${forma.nombre_forma} (${forma.tipo || 'Sin tipo'})`);
      });

    } else {
      console.log('❌ Tabla formas no encontrada');
      
      // Mostrar todas las tablas disponibles
      const [allTables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      console.log('📋 Tablas disponibles en la base de datos:');
      allTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testFormasConnection(); 