const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

const sequelize = new Sequelize({
  dialect: 'oracle',
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  logging: false,
  dialectOptions: {
    connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`,
    schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
  }
});

async function listCGBRITOTables() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');

    // Listar todas las tablas del esquema CGBRITO
    console.log('\n📋 Tablas en el esquema CGBRITO:');
    const tables = await sequelize.query(`
      SELECT table_name, num_rows, last_analyzed
      FROM user_tables 
      ORDER BY table_name
    `);
    
    if (tables[0].length > 0) {
      console.log('📊 Tablas encontradas:');
      tables[0].forEach(table => {
        console.log(`   - ${table.TABLE_NAME} (${table.NUM_ROWS || 0} filas, analizada: ${table.LAST_ANALYZED || 'N/A'})`);
      });
    } else {
      console.log('   No se encontraron tablas en el esquema CGBRITO');
    }

    // Listar vistas
    console.log('\n👁️ Vistas en el esquema CGBRITO:');
    const views = await sequelize.query(`
      SELECT view_name 
      FROM user_views 
      ORDER BY view_name
    `);
    
    if (views[0].length > 0) {
      console.log('📊 Vistas encontradas:');
      views[0].forEach(view => {
        console.log(`   - ${view.VIEW_NAME}`);
      });
    } else {
      console.log('   No se encontraron vistas en el esquema CGBRITO');
    }

    // Listar secuencias
    console.log('\n🔢 Secuencias en el esquema CGBRITO:');
    const sequences = await sequelize.query(`
      SELECT sequence_name, min_value, max_value, increment_by, last_number
      FROM user_sequences 
      ORDER BY sequence_name
    `);
    
    if (sequences[0].length > 0) {
      console.log('📊 Secuencias encontradas:');
      sequences[0].forEach(seq => {
        console.log(`   - ${seq.SEQUENCE_NAME} (${seq.MIN_VALUE} a ${seq.MAX_VALUE}, incremento: ${seq.INCREMENT_BY}, último: ${seq.LAST_NUMBER})`);
      });
    } else {
      console.log('   No se encontraron secuencias en el esquema CGBRITO');
    }

    // Listar índices
    console.log('\n🔍 Índices en el esquema CGBRITO:');
    const indexes = await sequelize.query(`
      SELECT index_name, table_name, uniqueness, status
      FROM user_indexes 
      ORDER BY table_name, index_name
    `);
    
    if (indexes[0].length > 0) {
      console.log('📊 Índices encontrados:');
      indexes[0].forEach(idx => {
        console.log(`   - ${idx.INDEX_NAME} en ${idx.TABLE_NAME} (${idx.UNIQUENESS}, ${idx.STATUS})`);
      });
    } else {
      console.log('   No se encontraron índices en el esquema CGBRITO');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

listCGBRITOTables();
