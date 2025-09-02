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

async function verifyEjecutivosDB() {
  try {
    console.log('🔍 Verificando tabla de ejecutivos...\n');

    // Conectar a la base de datos
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar que la tabla existe
    console.log('\n1️⃣ Verificando existencia de la tabla EJECUTIVOS...');
    const [tables] = await authSequelize.query(`
      SELECT TABLE_NAME 
      FROM USER_TABLES 
      WHERE TABLE_NAME = 'EJECUTIVOS'
    `);

    if (tables && tables.length > 0) {
      console.log('✅ Tabla EJECUTIVOS existe');
    } else {
      console.log('❌ Tabla EJECUTIVOS no existe');
      return;
    }

    // Verificar estructura de la tabla
    console.log('\n2️⃣ Verificando estructura de la tabla...');
    const [columns] = await authSequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_DEFAULT
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = 'EJECUTIVOS'
      ORDER BY COLUMN_ID
    `);

    console.log('📋 Estructura de la tabla:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.NULLABLE === 'N' ? 'NOT NULL' : 'NULL'}`);
    });

    // Verificar datos en la tabla
    console.log('\n3️⃣ Verificando datos en la tabla...');
    const [ejecutivos] = await authSequelize.query(`
      SELECT 
        e.ID,
        e.CEDULA,
        e.NOMBRE,
        e.APELLIDO,
        e.EMAIL,
        e.STATUS,
        e.CREATED_AT,
        u.ID as USER_ID,
        u.USERNAME,
        u.STATUS as USER_STATUS
      FROM CGBRITO.EJECUTIVOS e
      LEFT JOIN CGBRITO.USERS u ON e.EMAIL = u.EMAIL
      ORDER BY e.CREATED_AT DESC
    `);

    console.log(`📊 Total ejecutivos: ${ejecutivos.length}`);
    
    if (ejecutivos.length > 0) {
      console.log('\n📋 Ejecutivos en la base de datos:');
      console.log('ID\t\tCédula\t\tNombre\t\tEmail\t\t\tEstado\tUsuario\tEstado Usuario');
      console.log('-'.repeat(120));
      
      ejecutivos.forEach(ejec => {
        console.log(`${ejec.ID?.substring(0, 8)}...\t${ejec.CEDULA}\t${ejec.NOMBRE} ${ejec.APELLIDO}\t${ejec.EMAIL}\t${ejec.STATUS ? 'Activo' : 'Inactivo'}\t${ejec.USERNAME || 'N/A'}\t${ejec.USER_STATUS || 'N/A'}`);
      });
    } else {
      console.log('⚠️ No hay ejecutivos en la tabla');
    }

    // Verificar roles
    console.log('\n4️⃣ Verificando roles de ejecutivos...');
    const [roles] = await authSequelize.query(`
      SELECT DISTINCT u.ROLE_ID, r.NAME as ROLE_NAME, COUNT(*) as COUNT
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.EMAIL IN (SELECT EMAIL FROM CGBRITO.EJECUTIVOS)
      GROUP BY u.ROLE_ID, r.NAME
    `);

    console.log('📊 Distribución de roles:');
    roles.forEach(role => {
      console.log(`  - ${role.ROLE_NAME || 'Sin rol'} (ID: ${role.ROLE_ID}): ${role.COUNT} usuarios`);
    });

    // Verificar índices
    console.log('\n5️⃣ Verificando índices...');
    const [indexes] = await authSequelize.query(`
      SELECT INDEX_NAME, COLUMN_NAME
      FROM USER_IND_COLUMNS 
      WHERE TABLE_NAME = 'EJECUTIVOS'
      ORDER BY INDEX_NAME, COLUMN_POSITION
    `);

    console.log('📊 Índices en la tabla:');
    indexes.forEach(index => {
      console.log(`  - ${index.INDEX_NAME}: ${index.COLUMN_NAME}`);
    });

    console.log('\n🎉 Verificación completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await authSequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la verificación
verifyEjecutivosDB(); 