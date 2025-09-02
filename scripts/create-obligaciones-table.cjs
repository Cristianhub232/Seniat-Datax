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

async function createObligacionesTable() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');

    // Crear tabla de obligaciones tributarias
    console.log('\n📋 Creando tabla OBLIGACIONES_TRIBUTARIAS...');
    
    const createTableQuery = `
      CREATE TABLE OBLIGACIONES_TRIBUTARIAS (
        ID VARCHAR2(50) PRIMARY KEY,
        CODIGO_OBLIGACION VARCHAR2(20) NOT NULL,
        TIPO_IMPUESTO VARCHAR2(50) NOT NULL,
        DESCRIPCION VARCHAR2(500) NOT NULL,
        FECHA_LIMITE DATE NOT NULL,
        PERIODO_FISCAL VARCHAR2(20),
        TIPO_CONTRIBUYENTE VARCHAR2(100),
        TERMINAL_RIF VARCHAR2(10),
        PRIORIDAD VARCHAR2(20) DEFAULT 'MEDIA',
        ESTADO VARCHAR2(20) DEFAULT 'PENDIENTE',
        OBSERVACIONES VARCHAR2(1000),
        CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
        UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP
      )
    `;

    await sequelize.query(createTableQuery);
    console.log('✅ Tabla OBLIGACIONES_TRIBUTARIAS creada exitosamente');

    // Crear índices para optimizar consultas
    console.log('\n📋 Creando índices...');
    
    const indexes = [
      'CREATE INDEX IDX_OBLIGACIONES_FECHA ON OBLIGACIONES_TRIBUTARIAS(FECHA_LIMITE)',
      'CREATE INDEX IDX_OBLIGACIONES_TIPO ON OBLIGACIONES_TRIBUTARIAS(TIPO_IMPUESTO)',
      'CREATE INDEX IDX_OBLIGACIONES_TERMINAL ON OBLIGACIONES_TRIBUTARIAS(TERMINAL_RIF)',
      'CREATE INDEX IDX_OBLIGACIONES_ESTADO ON OBLIGACIONES_TRIBUTARIAS(ESTADO)'
    ];

    for (const indexQuery of indexes) {
      await sequelize.query(indexQuery);
    }
    console.log('✅ Índices creados exitosamente');

    // Insertar datos del calendario de obligaciones tributarias 2025
    console.log('\n📋 Insertando obligaciones del calendario 2025...');
    
    const obligaciones = [
      // Enero 2025
      {
        id: 'OBL-2025-001',
        codigo: 'IVA-001',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-01-15',
        periodo: 'DICIEMBRE 2024',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      {
        id: 'OBL-2025-002',
        codigo: 'ISLR-001',
        tipo: 'ISLR',
        descripcion: 'Retención ISLR - Sueldos y Salarios',
        fecha: '2025-01-16',
        periodo: 'DICIEMBRE 2024',
        tipoContribuyente: 'Patronos',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      {
        id: 'OBL-2025-003',
        codigo: 'IVA-002',
        tipo: 'IVA',
        descripcion: 'Retención IVA - Servicios',
        fecha: '2025-01-17',
        periodo: 'DICIEMBRE 2024',
        tipoContribuyente: 'Agentes de retención',
        terminal: 'Todos',
        prioridad: 'MEDIA'
      },
      {
        id: 'OBL-2025-004',
        codigo: 'ISLR-002',
        tipo: 'ISLR',
        descripcion: 'Declaración ISLR Anual',
        fecha: '2025-01-18',
        periodo: '2024',
        tipoContribuyente: 'Personas naturales',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      {
        id: 'OBL-2025-005',
        codigo: 'IVA-003',
        tipo: 'IVA',
        descripcion: 'Información de Compras',
        fecha: '2025-01-19',
        periodo: 'DICIEMBRE 2024',
        tipoContribuyente: 'Contribuyentes especiales',
        terminal: 'Todos',
        prioridad: 'MEDIA'
      },
      // Febrero 2025
      {
        id: 'OBL-2025-006',
        codigo: 'IVA-004',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-02-15',
        periodo: 'ENERO 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      {
        id: 'OBL-2025-007',
        codigo: 'ISLR-003',
        tipo: 'ISLR',
        descripcion: 'Retención ISLR - Sueldos y Salarios',
        fecha: '2025-02-16',
        periodo: 'ENERO 2025',
        tipoContribuyente: 'Patronos',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Marzo 2025
      {
        id: 'OBL-2025-008',
        codigo: 'IVA-005',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-03-15',
        periodo: 'FEBRERO 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Abril 2025
      {
        id: 'OBL-2025-009',
        codigo: 'IVA-006',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-04-15',
        periodo: 'MARZO 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Mayo 2025
      {
        id: 'OBL-2025-010',
        codigo: 'IVA-007',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-05-15',
        periodo: 'ABRIL 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Junio 2025
      {
        id: 'OBL-2025-011',
        codigo: 'IVA-008',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-06-15',
        periodo: 'MAYO 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Julio 2025
      {
        id: 'OBL-2025-012',
        codigo: 'IVA-009',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-07-15',
        periodo: 'JUNIO 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Agosto 2025
      {
        id: 'OBL-2025-013',
        codigo: 'IVA-010',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-08-15',
        periodo: 'JULIO 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Septiembre 2025
      {
        id: 'OBL-2025-014',
        codigo: 'IVA-011',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-09-15',
        periodo: 'AGOSTO 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Octubre 2025
      {
        id: 'OBL-2025-015',
        codigo: 'IVA-012',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-10-15',
        periodo: 'SEPTIEMBRE 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Noviembre 2025
      {
        id: 'OBL-2025-016',
        codigo: 'IVA-013',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-11-15',
        periodo: 'OCTUBRE 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      },
      // Diciembre 2025
      {
        id: 'OBL-2025-017',
        codigo: 'IVA-014',
        tipo: 'IVA',
        descripcion: 'Declaración y Pago IVA Mensual',
        fecha: '2025-12-15',
        periodo: 'NOVIEMBRE 2025',
        tipoContribuyente: 'Todos los contribuyentes',
        terminal: 'Todos',
        prioridad: 'ALTA'
      }
    ];

    for (const obligacion of obligaciones) {
      const insertQuery = `
        INSERT INTO OBLIGACIONES_TRIBUTARIAS (
          ID, CODIGO_OBLIGACION, TIPO_IMPUESTO, DESCRIPCION, FECHA_LIMITE, 
          PERIODO_FISCAL, TIPO_CONTRIBUYENTE, TERMINAL_RIF, PRIORIDAD, ESTADO
        ) VALUES (
          '${obligacion.id}', '${obligacion.codigo}', '${obligacion.tipo}', 
          '${obligacion.descripcion}', TO_DATE('${obligacion.fecha}', 'YYYY-MM-DD'),
          '${obligacion.periodo}', '${obligacion.tipoContribuyente}', 
          '${obligacion.terminal}', '${obligacion.prioridad}', 'PENDIENTE'
        )
      `;
      
      await sequelize.query(insertQuery);
    }

    console.log(`✅ ${obligaciones.length} obligaciones insertadas exitosamente`);

    // Verificar los datos insertados
    console.log('\n📊 Verificando datos insertados...');
    const countResult = await sequelize.query('SELECT COUNT(*) as count FROM OBLIGACIONES_TRIBUTARIAS');
    console.log(`   - Total de obligaciones: ${countResult[0][0].COUNT}`);

    const sampleResult = await sequelize.query(`
      SELECT ID, CODIGO_OBLIGACION, TIPO_IMPUESTO, DESCRIPCION, 
             TO_CHAR(FECHA_LIMITE, 'DD/MM/YYYY') as FECHA_LIMITE, 
             PRIORIDAD, ESTADO 
      FROM OBLIGACIONES_TRIBUTARIAS 
      ORDER BY FECHA_LIMITE 
      FETCH FIRST 5 ROWS ONLY
    `);

    console.log('\n📋 Muestra de obligaciones insertadas:');
    sampleResult[0].forEach((row, index) => {
      console.log(`${index + 1}. ${row.CODIGO_OBLIGACION} - ${row.TIPO_IMPUESTO}`);
      console.log(`   Descripción: ${row.DESCRIPCION}`);
      console.log(`   Fecha límite: ${row.FECHA_LIMITE}`);
      console.log(`   Prioridad: ${row.PRIORIDAD} | Estado: ${row.ESTADO}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

createObligacionesTable(); 