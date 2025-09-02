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

async function debugMetrics() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');

    // Debug EJECUTIVOS
    console.log('\n📋 Debug EJECUTIVOS...');
    const ejecutivosStatus = await sequelize.query(`
      SELECT DISTINCT status, COUNT(*) as count 
      FROM ejecutivos 
      GROUP BY status
    `);
    console.log('Valores de STATUS en EJECUTIVOS:');
    ejecutivosStatus[0].forEach(row => {
      console.log(`   - STATUS = ${row.STATUS}: ${row.COUNT} registros`);
    });

    // Debug USERS
    console.log('\n📋 Debug USERS...');
    const usersRoleStatus = await sequelize.query(`
      SELECT DISTINCT role_id, status, COUNT(*) as count 
      FROM users 
      GROUP BY role_id, status
    `);
    console.log('Valores de ROLE_ID y STATUS en USERS:');
    usersRoleStatus[0].forEach(row => {
      console.log(`   - ROLE_ID = ${row.ROLE_ID}, STATUS = '${row.STATUS}': ${row.COUNT} registros`);
    });

    // Debug ROLES
    console.log('\n📋 Debug ROLES...');
    const roles = await sequelize.query(`
      SELECT id, name, description 
      FROM roles
    `);
    console.log('Roles disponibles:');
    roles[0].forEach(row => {
      console.log(`   - ID = ${row.ID}, NAME = '${row.NAME}', DESCRIPTION = '${row.DESCRIPTION}'`);
    });

    // Contar totales
    console.log('\n📊 Contando totales...');
    
    const ejecutivosTotal = await sequelize.query('SELECT COUNT(*) as count FROM EJECUTIVOS');
    console.log(`   - EJECUTIVOS total: ${ejecutivosTotal[0][0].COUNT} registros`);
    
    const usersTotal = await sequelize.query('SELECT COUNT(*) as count FROM USERS');
    console.log(`   - USERS total: ${usersTotal[0][0].COUNT} registros`);
    
    const carteraTotal = await sequelize.query('SELECT COUNT(*) as count FROM CARTERA_CONTRIBUYENTES');
    console.log(`   - CARTERA_CONTRIBUYENTES total: ${carteraTotal[0][0].COUNT} registros`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

debugMetrics(); 