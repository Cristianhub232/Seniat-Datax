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

async function checkTableStructure() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');

    // Verificar estructura de USERS
    console.log('\n📋 Verificando estructura de USERS...');
    const usersStructure = await sequelize.query(`
      SELECT column_name, data_type, nullable 
      FROM user_tab_columns 
      WHERE table_name = 'USERS' 
      ORDER BY column_id
    `);
    console.log('Columnas en USERS:');
    usersStructure[0].forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}, ${col.NULLABLE === 'Y' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar estructura de EJECUTIVOS
    console.log('\n📋 Verificando estructura de EJECUTIVOS...');
    const ejecutivosStructure = await sequelize.query(`
      SELECT column_name, data_type, nullable 
      FROM user_tab_columns 
      WHERE table_name = 'EJECUTIVOS' 
      ORDER BY column_id
    `);
    console.log('Columnas en EJECUTIVOS:');
    ejecutivosStructure[0].forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}, ${col.NULLABLE === 'Y' ? 'NULL' : 'NOT NULL'})`);
    });

    // Verificar estructura de CARTERA_CONTRIBUYENTES
    console.log('\n📋 Verificando estructura de CARTERA_CONTRIBUYENTES...');
    const carteraStructure = await sequelize.query(`
      SELECT column_name, data_type, nullable 
      FROM user_tab_columns 
      WHERE table_name = 'CARTERA_CONTRIBUYENTES' 
      ORDER BY column_id
    `);
    console.log('Columnas en CARTERA_CONTRIBUYENTES:');
    carteraStructure[0].forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}, ${col.NULLABLE === 'Y' ? 'NULL' : 'NOT NULL'})`);
    });

    // Contar registros
    console.log('\n📊 Contando registros...');
    
    const usersCount = await sequelize.query('SELECT COUNT(*) as count FROM USERS');
    console.log(`   - USERS: ${usersCount[0][0].COUNT} registros`);
    
    const ejecutivosCount = await sequelize.query('SELECT COUNT(*) as count FROM EJECUTIVOS');
    console.log(`   - EJECUTIVOS: ${ejecutivosCount[0][0].COUNT} registros`);
    
    const carteraCount = await sequelize.query('SELECT COUNT(*) as count FROM CARTERA_CONTRIBUYENTES');
    console.log(`   - CARTERA_CONTRIBUYENTES: ${carteraCount[0][0].COUNT} registros`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

checkTableStructure(); 