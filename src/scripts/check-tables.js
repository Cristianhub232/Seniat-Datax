import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Conexión a la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function checkTables() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // Verificar tablas en el esquema datalake
    console.log('📋 Verificando tablas en el esquema datalake...');
    const [datalakeTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'datalake' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Tablas en esquema datalake:');
    if (datalakeTables.length > 0) {
      datalakeTables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('   No se encontraron tablas en el esquema datalake');
    }

    // Verificar tablas en el esquema public
    console.log('\n📋 Verificando tablas en el esquema public...');
    const [publicTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Tablas en esquema public:');
    if (publicTables.length > 0) {
      publicTables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('   No se encontraron tablas en el esquema public');
    }

    // Buscar tablas que contengan "planilla" en el nombre
    console.log('\n🔍 Buscando tablas que contengan "planilla"...');
    const [planillaTables] = await sequelize.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name ILIKE '%planilla%' 
      ORDER BY table_schema, table_name;
    `);
    
    console.log('📊 Tablas que contienen "planilla":');
    if (planillaTables.length > 0) {
      planillaTables.forEach(table => {
        console.log(`   - ${table.table_schema}.${table.table_name}`);
      });
    } else {
      console.log('   No se encontraron tablas con "planilla" en el nombre');
    }

    // Buscar tablas que contengan "banco" en el nombre
    console.log('\n🔍 Buscando tablas que contengan "banco"...');
    const [bancoTables] = await sequelize.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name ILIKE '%banco%' 
      ORDER BY table_schema, table_name;
    `);
    
    console.log('📊 Tablas que contienen "banco":');
    if (bancoTables.length > 0) {
      bancoTables.forEach(table => {
        console.log(`   - ${table.table_schema}.${table.table_name}`);
      });
    } else {
      console.log('   No se encontraron tablas con "banco" en el nombre');
    }

    // Listar todas las tablas disponibles
    console.log('\n📋 Todas las tablas disponibles:');
    const [allTables] = await sequelize.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name;
    `);
    
    console.log('📊 Todas las tablas:');
    if (allTables.length > 0) {
      allTables.forEach(table => {
        console.log(`   - ${table.table_schema}.${table.table_name}`);
      });
    } else {
      console.log('   No se encontraron tablas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
}

// Ejecutar el script
checkTables(); 