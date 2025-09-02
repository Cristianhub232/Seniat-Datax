
import { Sequelize } from 'sequelize';

// Cargar variables de entorno si no están disponibles
if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
  } catch (error) {
    console.warn('No se pudo cargar .env.local');
  }
}

// Configuración Oracle para SENIAT
const oracleConfig = {
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
};

// Conexión principal para la aplicación (Oracle)
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

// Conexión específica para autenticación (esquema CGBRITO)
const authSequelize = new Sequelize({
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
  },
  define: {
    schema: oracleConfig.schema
  },
  quoteIdentifiers: false
});

export default sequelize;
export { authSequelize };
