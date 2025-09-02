const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function insertSampleData() {
  let connection;
  
  try {
    // Configuración de conexión
    const config = {
      user: process.env.ORACLE_USERNAME,
      password: process.env.ORACLE_PASSWORD,
      connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DATABASE}`,
    };

    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa a Oracle');

    // Verificar si ya hay datos
    const countResult = await connection.execute('SELECT COUNT(*) as total FROM TICKETS');
    const existingCount = countResult.rows[0][0];
    
    if (existingCount > 0) {
      console.log(`📊 Ya existen ${existingCount} tickets en la base de datos`);
      console.log('¿Deseas continuar e insertar datos de ejemplo? (s/n)');
      
      // Para scripts automáticos, continuamos
      console.log('Continuando con la inserción...');
    }

    // Datos de ejemplo
    const sampleData = [
      {
        asunto: 'Configuración de Metabase',
        concepto: 'Necesito configurar el acceso a Metabase para el equipo de análisis fiscal',
        estado: 'En Proceso',
        prioridad: 'Alta',
        fecha_limite: '2025-01-15 17:00:00',
        ejecutivo_id: 1,
        creado_por: 1,
        observaciones: 'Prioridad alta para el equipo de análisis'
      },
      {
        asunto: 'Mantenimiento de Base de Datos',
        concepto: 'Revisar y optimizar las consultas de la tabla de obligaciones tributarias',
        estado: 'Pendiente',
        prioridad: 'Media',
        fecha_limite: '2025-01-20 17:00:00',
        ejecutivo_id: 2,
        creado_por: 1,
        observaciones: 'Revisar rendimiento de consultas'
      },
      {
        asunto: 'Actualización de Usuarios',
        concepto: 'Migrar usuarios del sistema anterior al nuevo sistema de autenticación',
        estado: 'Completado',
        prioridad: 'Alta',
        fecha_limite: '2025-01-10 17:00:00',
        ejecutivo_id: 1,
        creado_por: 1,
        observaciones: 'Migración completada exitosamente'
      },
      {
        asunto: 'Reporte de Auditoría',
        concepto: 'Generar reporte mensual de auditoría para la dirección fiscal',
        estado: 'Pendiente',
        prioridad: 'Crítica',
        fecha_limite: '2025-01-25 17:00:00',
        ejecutivo_id: 3,
        creado_por: 1,
        observaciones: 'Reporte requerido por dirección'
      },
      {
        asunto: 'Backup de Sistema',
        concepto: 'Configurar backup automático de la base de datos Oracle',
        estado: 'En Proceso',
        prioridad: 'Alta',
        fecha_limite: '2025-01-18 17:00:00',
        ejecutivo_id: 2,
        creado_por: 1,
        observaciones: 'Configurar cron job para backups'
      }
    ];

    console.log('📋 Insertando datos de ejemplo...');
    let insertedCount = 0;
    
    for (const data of sampleData) {
      try {
        const insertQuery = `
          INSERT INTO tickets (asunto, concepto, estado, prioridad, fecha_limite, ejecutivo_id, creado_por, observaciones) 
          VALUES (:asunto, :concepto, :estado, :prioridad, TO_TIMESTAMP(:fecha_limite, 'YYYY-MM-DD HH24:MI:SS'), :ejecutivo_id, :creado_por, :observaciones)
        `;
        
        await connection.execute(insertQuery, [
          data.asunto,
          data.concepto,
          data.estado,
          data.prioridad,
          data.fecha_limite,
          data.ejecutivo_id,
          data.creado_por,
          data.observaciones
        ]);
        
        insertedCount++;
        console.log(`✅ Ticket "${data.asunto}" insertado`);
        
      } catch (error) {
        if (error.code === 1) { // ORA-00001: unique constraint violated
          console.log(`⚠️ Ticket "${data.asunto}" ya existe, omitiendo...`);
        } else {
          console.error(`❌ Error insertando ticket "${data.asunto}":`, error.message);
        }
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`  - Tickets insertados: ${insertedCount}`);
    console.log(`  - Total en base de datos: ${existingCount + insertedCount}`);

    // Commit de los cambios
    await connection.commit();
    console.log('✅ Cambios confirmados en la base de datos');

    // Verificar la estructura creada
    console.log('\n📊 Verificando estructura de tablas...');
    
    const ticketsStructure = await connection.execute(`
      SELECT column_name, data_type, data_length, nullable, data_default
      FROM user_tab_columns 
      WHERE table_name = 'TICKETS'
      ORDER BY column_id
    `);
    
    console.log('\n🏗️ Estructura de la tabla TICKETS:');
    ticketsStructure.rows.forEach(row => {
      console.log(`  - ${row[0]}: ${row[1]}(${row[2] || 'N/A'}) ${row[3] === 'N' ? 'NOT NULL' : 'NULL'} ${row[4] ? `DEFAULT: ${row[4]}` : ''}`);
    });

    const finalCount = await connection.execute('SELECT COUNT(*) as total FROM TICKETS');
    console.log(`\n📈 Total de tickets en la base de datos: ${finalCount.rows[0][0]}`);

    console.log('\n🎉 ¡Datos de ejemplo insertados exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) {
      await connection.rollback();
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Conexión cerrada');
      } catch (err) {
        console.error('Error cerrando conexión:', err);
      }
    }
  }
}

// Ejecutar el script
insertSampleData();
