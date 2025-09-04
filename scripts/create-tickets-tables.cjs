const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function createTicketsTables() {
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

    // Crear tabla de tickets
    const createTicketsTable = `
      CREATE TABLE tickets (
        id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        asunto VARCHAR2(255) NOT NULL,
        concepto CLOB NOT NULL,
        estado VARCHAR2(50) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Cancelado')),
        prioridad VARCHAR2(20) DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Crítica')),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_limite TIMESTAMP,
        fecha_completado TIMESTAMP,
        ejecutivo_id VARCHAR2(36),
        creado_por VARCHAR2(36) NOT NULL,
        observaciones CLOB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear tabla de historial de tickets
    const createTicketHistoryTable = `
      CREATE TABLE ticket_history (
        id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        ticket_id NUMBER NOT NULL,
        campo_cambiado VARCHAR2(100) NOT NULL,
        valor_anterior VARCHAR2(4000),
        valor_nuevo VARCHAR2(4000),
        usuario_id NUMBER NOT NULL,
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      )
    `;

    // Crear índices para mejor rendimiento
    const createIndexes = `
      CREATE INDEX idx_tickets_estado ON tickets(estado);
      CREATE INDEX idx_tickets_prioridad ON tickets(prioridad);
      CREATE INDEX idx_tickets_ejecutivo ON tickets(ejecutivo_id);
      CREATE INDEX idx_tickets_fecha_creacion ON tickets(fecha_creacion);
      CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
    `;

    // Crear secuencia para IDs (alternativa a IDENTITY)
    const createSequence = `
      CREATE SEQUENCE tickets_seq START WITH 1 INCREMENT BY 1;
    `;

    console.log('📋 Creando tabla de tickets...');
    await connection.execute(createTicketsTable);
    console.log('✅ Tabla tickets creada exitosamente');

    console.log('📋 Creando tabla de historial...');
    await connection.execute(createTicketHistoryTable);
    console.log('✅ Tabla ticket_history creada exitosamente');

    console.log('📋 Creando índices...');
    const indexStatements = createIndexes.split(';').filter(stmt => stmt.trim());
    for (const stmt of indexStatements) {
      if (stmt.trim()) {
        await connection.execute(stmt);
      }
    }
    console.log('✅ Índices creados exitosamente');

    // Insertar datos de ejemplo uno por uno
    const sampleData = [
      {
        asunto: 'Configuración de Metabase',
        concepto: 'Necesito configurar el acceso a Metabase para el equipo de análisis fiscal',
        estado: 'En Proceso',
        prioridad: 'Alta',
        fecha_limite: '2025-01-15 17:00:00',
        ejecutivo_id: null,
        creado_por: 'admin',
        observaciones: 'Prioridad alta para el equipo de análisis'
      },
      {
        asunto: 'Mantenimiento de Base de Datos',
        concepto: 'Revisar y optimizar las consultas de la tabla de obligaciones tributarias',
        estado: 'Pendiente',
        prioridad: 'Media',
        fecha_limite: '2025-01-20 17:00:00',
        ejecutivo_id: null,
        creado_por: 'admin',
        observaciones: 'Revisar rendimiento de consultas'
      },
      {
        asunto: 'Actualización de Usuarios',
        concepto: 'Migrar usuarios del sistema anterior al nuevo sistema de autenticación',
        estado: 'Completado',
        prioridad: 'Alta',
        fecha_limite: '2025-01-10 17:00:00',
        ejecutivo_id: null,
        creado_por: 'admin',
        observaciones: 'Migración completada exitosamente'
      },
      {
        asunto: 'Reporte de Auditoría',
        concepto: 'Generar reporte mensual de auditoría para la dirección fiscal',
        estado: 'Pendiente',
        prioridad: 'Crítica',
        fecha_limite: '2025-01-25 17:00:00',
        ejecutivo_id: null,
        creado_por: 'admin',
        observaciones: 'Reporte requerido por dirección'
      },
      {
        asunto: 'Backup de Sistema',
        concepto: 'Configurar backup automático de la base de datos Oracle',
        estado: 'En Proceso',
        prioridad: 'Alta',
        fecha_limite: '2025-01-18 17:00:00',
        ejecutivo_id: null,
        creado_por: 'admin',
        observaciones: 'Configurar cron job para backups'
      }
    ];

    console.log('📋 Insertando datos de ejemplo...');
    for (const data of sampleData) {
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
    }
    console.log('✅ Datos de ejemplo insertados exitosamente');

    console.log('📋 Insertando datos de ejemplo...');
    await connection.execute(insertSampleData);
    console.log('✅ Datos de ejemplo insertados exitosamente');

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

    const ticketCount = await connection.execute('SELECT COUNT(*) as total FROM tickets');
    console.log(`\n📈 Total de tickets creados: ${ticketCount.rows[0][0]}`);

    console.log('\n🎉 ¡Sistema de tickets creado exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('  1. Crear el módulo de tickets en Next.js');
    console.log('  2. Implementar las APIs para CRUD');
    console.log('  3. Crear la interfaz Kanban');
    console.log('  4. Configurar permisos de administrador');

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
createTicketsTables();
