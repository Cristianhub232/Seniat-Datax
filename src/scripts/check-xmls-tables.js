import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Conexión a la base de datos XMLS
const xmlsDatabaseUrl = process.env.XMLS_DATABASE_URL;
if (!xmlsDatabaseUrl) {
  console.error('❌ XMLS_DATABASE_URL no está configurada');
  process.exit(1);
}

const xmlsSequelize = new Sequelize(xmlsDatabaseUrl, {
  dialect: 'postgres',
  logging: false,
});

async function checkXMLSTables() {
  try {
    console.log('🔌 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // Verificar tablas en el esquema datalake
    console.log('📋 Verificando tablas en el esquema datalake...');
    const [datalakeTables] = await xmlsSequelize.query(`
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
    const [publicTables] = await xmlsSequelize.query(`
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
    const [planillaTables] = await xmlsSequelize.query(`
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
    const [bancoTables] = await xmlsSequelize.query(`
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
    const [allTables] = await xmlsSequelize.query(`
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
    await xmlsSequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
}

// Ejecutar el script
checkXMLSTables(); 