const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
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

async function insertTestEjecutivos() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Datos de ejecutivos de prueba
    const ejecutivos = [
      {
        cedula: 'V-12345678',
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@seniat.gob.ve',
        password: 'password123'
      },
      {
        cedula: 'V-87654321',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos.rodriguez@seniat.gob.ve',
        password: 'password123'
      },
      {
        cedula: 'V-11223344',
        nombre: 'Ana',
        apellido: 'López',
        email: 'ana.lopez@seniat.gob.ve',
        password: 'password123'
      },
      {
        cedula: 'V-55667788',
        nombre: 'Luis',
        apellido: 'Martínez',
        email: 'luis.martinez@seniat.gob.ve',
        password: 'password123'
      },
      {
        cedula: 'V-99887766',
        nombre: 'Carmen',
        apellido: 'Pérez',
        email: 'carmen.perez@seniat.gob.ve',
        password: 'password123'
      }
    ];

    console.log('🔨 Insertando ejecutivos de prueba...');

    for (const ejecutivo of ejecutivos) {
      try {
        // Verificar si ya existe
        const [existing] = await authSequelize.query(`
          SELECT ID FROM CGBRITO.EJECUTIVOS 
          WHERE CEDULA = ? OR EMAIL = ?
        `, {
          replacements: [ejecutivo.cedula, ejecutivo.email],
          type: 'SELECT'
        });

        if (existing && existing.length > 0) {
          console.log(`⚠️  Ejecutivo ${ejecutivo.cedula} ya existe, saltando...`);
          continue;
        }

        // Crear el ejecutivo
        await authSequelize.query(`
          INSERT INTO CGBRITO.EJECUTIVOS (CEDULA, NOMBRE, APELLIDO, EMAIL, STATUS, CREATED_AT, UPDATED_AT)
          VALUES (?, ?, ?, ?, 1, SYSDATE, SYSDATE)
        `, {
          replacements: [ejecutivo.cedula, ejecutivo.nombre, ejecutivo.apellido, ejecutivo.email],
          type: 'INSERT'
        });

        // Crear usuario asociado
        const hashedPassword = await bcrypt.hash(ejecutivo.password, 10);
        const username = ejecutivo.email.split('@')[0];

        await authSequelize.query(`
          INSERT INTO CGBRITO.USERS (ID, USERNAME, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, ROLE_ID, STATUS, CREATED_AT, UPDATED_AT)
          VALUES (SYS_GUID(), ?, ?, ?, ?, ?, 5, 'active', SYSDATE, SYSDATE)
        `, {
          replacements: [username, ejecutivo.email, hashedPassword, ejecutivo.nombre, ejecutivo.apellido],
          type: 'INSERT'
        });

        console.log(`✅ Ejecutivo ${ejecutivo.cedula} creado exitosamente`);
      } catch (error) {
        console.error(`❌ Error creando ejecutivo ${ejecutivo.cedula}:`, error.message);
      }
    }

    // Verificar ejecutivos creados
    console.log('\n🔍 Verificando ejecutivos creados...');
    const [ejecutivosCreados] = await authSequelize.query(`
      SELECT 
        e.CEDULA,
        e.NOMBRE,
        e.APELLIDO,
        e.EMAIL,
        e.STATUS,
        CASE WHEN u.ID IS NOT NULL THEN 'Sí' ELSE 'No' END as TIENE_CUENTA
      FROM CGBRITO.EJECUTIVOS e
      LEFT JOIN CGBRITO.USERS u ON e.EMAIL = u.EMAIL
      ORDER BY e.CREATED_AT DESC
    `);

    console.log('\n📋 Ejecutivos en la base de datos:');
    console.log('Cédula\t\tNombre\t\tEmail\t\t\tEstado\tCuenta');
    console.log('-'.repeat(80));
    
    ejecutivosCreados.forEach(ejec => {
      console.log(`${ejec.CEDULA}\t${ejec.NOMBRE} ${ejec.APELLIDO}\t${ejec.EMAIL}\t${ejec.STATUS ? 'Activo' : 'Inactivo'}\t${ejec.TIENE_CUENTA}`);
    });

    console.log(`\n🎉 Proceso completado. Total de ejecutivos: ${ejecutivosCreados.length}`);

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await authSequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
insertTestEjecutivos(); 