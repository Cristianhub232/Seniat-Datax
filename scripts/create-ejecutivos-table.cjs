const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

// Configuración Oracle para SENIAT
const oracleConfig = {
  host: process.env.ORACLE_HOST || '172.16.32.73',
  port: parseInt(process.env.ORACLE_PORT || '1521'),
  database: process.env.ORACLE_DATABASE || 'DWREPO',
  username: process.env.ORACLE_USERNAME || 'CGBRITO',
  password: process.env.ORACLE_PASSWORD || 'cgkbrito',
  schema: process.env.ORACLE_SCHEMA || 'CGBRITO'
};

// Configuración de la conexión Oracle
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

async function createEjecutivosTable() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Crear tabla EJECUTIVOS
    console.log('🔨 Creando tabla EJECUTIVOS...');
    await authSequelize.query(`
      CREATE TABLE CGBRITO.EJECUTIVOS (
        ID VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
        CEDULA VARCHAR2(20) NOT NULL UNIQUE,
        NOMBRE VARCHAR2(100) NOT NULL,
        APELLIDO VARCHAR2(100) NOT NULL,
        EMAIL VARCHAR2(255) NOT NULL UNIQUE,
        STATUS NUMBER(1) DEFAULT 1 NOT NULL,
        CREATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL,
        UPDATED_AT TIMESTAMP DEFAULT SYSDATE NOT NULL
      )
    `);

    console.log('✅ Tabla EJECUTIVOS creada exitosamente');

    // Crear índices para mejorar el rendimiento
    console.log('🔨 Creando índices...');
    await authSequelize.query(`
      CREATE INDEX IDX_EJECUTIVOS_EMAIL ON CGBRITO.EJECUTIVOS(EMAIL)
    `);
    await authSequelize.query(`
      CREATE INDEX IDX_EJECUTIVOS_STATUS ON CGBRITO.EJECUTIVOS(STATUS)
    `);
    await authSequelize.query(`
      CREATE INDEX IDX_EJECUTIVOS_CREATED_AT ON CGBRITO.EJECUTIVOS(CREATED_AT)
    `);

    console.log('✅ Índices creados exitosamente');

    // Verificar que la tabla se creó correctamente
    console.log('🔍 Verificando estructura de la tabla...');
    const [columns] = await authSequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_DEFAULT
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = 'EJECUTIVOS'
      ORDER BY COLUMN_ID
    `);

    console.log('📋 Estructura de la tabla EJECUTIVOS:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.NULLABLE === 'N' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n🎉 Tabla EJECUTIVOS creada y configurada correctamente');
    console.log('📝 La tabla incluye:');
    console.log('  - ID único (GUID)');
    console.log('  - Cédula (única)');
    console.log('  - Nombre y Apellido');
    console.log('  - Email (único)');
    console.log('  - Estado (activo/inactivo)');
    console.log('  - Timestamps de creación y actualización');

  } catch (error) {
    console.error('❌ Error creando tabla EJECUTIVOS:', error.message);
    
    if (error.message.includes('ORA-00955')) {
      console.log('ℹ️  La tabla EJECUTIVOS ya existe');
    } else {
      console.error('🔍 Detalles del error:', error);
    }
  } finally {
    await authSequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
createEjecutivosTable(); 