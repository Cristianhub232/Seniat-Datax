const { Sequelize } = require('sequelize');

// Configuración Oracle para CGBRITO
const oracleConfig = {
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
};

async function cleanupAuthSystem() {
  const sequelize = new Sequelize({
    dialect: 'oracle',
    host: oracleConfig.host,
    port: oracleConfig.port,
    database: oracleConfig.database,
    username: oracleConfig.username,
    password: oracleConfig.password,
    logging: false,
    dialectOptions: {
      connectString: `${oracleConfig.host}:${oracleConfig.port}/${oracleConfig.database}`,
      schema: oracleConfig.schema
    }
  });

  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');

    console.log('🗑️ Limpiando sistema de autenticación...');

    // Eliminar tablas en orden correcto (por dependencias)
    const tablesToDrop = [
      'ROLE_MENU_PERMISSIONS',
      'ROLE_PERMISSIONS', 
      'SESSIONS',
      'AUDIT_LOGS',
      'NOTIFICATIONS',
      'TICKET_HISTORY',
      'TICKETS',
      'USERS',
      'ROLES',
      'PERMISSIONS',
      'MENUS'
    ];

    for (const table of tablesToDrop) {
      try {
        console.log(`   🗑️ Eliminando tabla ${table}...`);
        await sequelize.query(`DROP TABLE ${oracleConfig.schema}.${table} CASCADE CONSTRAINTS`);
        console.log(`   ✅ Tabla ${table} eliminada`);
      } catch (error) {
        if (error.message.includes('ORA-00942')) {
          console.log(`   ℹ️ Tabla ${table} no existe, continuando...`);
        } else {
          console.log(`   ⚠️ Error eliminando ${table}:`, error.message);
        }
      }
    }

    console.log('✅ Sistema de autenticación limpiado completamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

cleanupAuthSystem();

