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

async function verifyObligacionesData() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');

    // Verificar estructura de la tabla
    console.log('\n📋 Verificando estructura de la tabla OBLIGACIONES_TRIBUTARIAS...');
    const structureResult = await sequelize.query(`
      SELECT column_name, data_type, nullable, data_length
      FROM user_tab_columns 
      WHERE table_name = 'OBLIGACIONES_TRIBUTARIAS' 
      ORDER BY column_id
    `);
    
    console.log('Columnas en OBLIGACIONES_TRIBUTARIAS:');
    structureResult[0].forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.DATA_LENGTH ? '(' + col.DATA_LENGTH + ')' : ''}, ${col.NULLABLE === 'Y' ? 'NULL' : 'NOT NULL'})`);
    });

    // Contar total de registros
    console.log('\n📊 Estadísticas generales...');
    const countResult = await sequelize.query('SELECT COUNT(*) as count FROM OBLIGACIONES_TRIBUTARIAS');
    console.log(`   - Total de obligaciones: ${countResult[0][0].COUNT}`);

    // Contar por tipo de impuesto
    const tipoCountResult = await sequelize.query(`
      SELECT TIPO_IMPUESTO, COUNT(*) as count 
      FROM OBLIGACIONES_TRIBUTARIAS 
      GROUP BY TIPO_IMPUESTO 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Distribución por tipo de impuesto:');
    tipoCountResult[0].forEach(row => {
      console.log(`   - ${row.TIPO_IMPUESTO}: ${row.COUNT} obligaciones`);
    });

    // Contar por prioridad
    const prioridadCountResult = await sequelize.query(`
      SELECT PRIORIDAD, COUNT(*) as count 
      FROM OBLIGACIONES_TRIBUTARIAS 
      GROUP BY PRIORIDAD 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Distribución por prioridad:');
    prioridadCountResult[0].forEach(row => {
      console.log(`   - ${row.PRIORIDAD}: ${row.COUNT} obligaciones`);
    });

    // Contar por estado
    const estadoCountResult = await sequelize.query(`
      SELECT ESTADO, COUNT(*) as count 
      FROM OBLIGACIONES_TRIBUTARIAS 
      GROUP BY ESTADO 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Distribución por estado:');
    estadoCountResult[0].forEach(row => {
      console.log(`   - ${row.ESTADO}: ${row.COUNT} obligaciones`);
    });

    // Mostrar obligaciones del mes actual y próximas
    console.log('\n📅 Obligaciones del mes actual y próximas...');
    const currentMonthResult = await sequelize.query(`
      SELECT ID, CODIGO_OBLIGACION, TIPO_IMPUESTO, DESCRIPCION, 
             TO_CHAR(FECHA_LIMITE, 'DD/MM/YYYY') as FECHA_LIMITE, 
             PERIODO_FISCAL, PRIORIDAD, ESTADO
      FROM OBLIGACIONES_TRIBUTARIAS 
      WHERE FECHA_LIMITE >= SYSDATE 
      ORDER BY FECHA_LIMITE 
      FETCH FIRST 10 ROWS ONLY
    `);

    console.log('Próximas obligaciones:');
    currentMonthResult[0].forEach((row, index) => {
      console.log(`${index + 1}. ${row.CODIGO_OBLIGACION} - ${row.TIPO_IMPUESTO}`);
      console.log(`   Descripción: ${row.DESCRIPCION}`);
      console.log(`   Fecha límite: ${row.FECHA_LIMITE}`);
      console.log(`   Período fiscal: ${row.PERIODO_FISCAL}`);
      console.log(`   Prioridad: ${row.PRIORIDAD} | Estado: ${row.ESTADO}`);
      console.log('');
    });

    // Mostrar obligaciones por terminal RIF (si aplica)
    console.log('\n🔢 Obligaciones por terminal RIF...');
    const terminalResult = await sequelize.query(`
      SELECT TERMINAL_RIF, COUNT(*) as count 
      FROM OBLIGACIONES_TRIBUTARIAS 
      GROUP BY TERMINAL_RIF 
      ORDER BY count DESC
    `);
    
    terminalResult[0].forEach(row => {
      console.log(`   - Terminal ${row.TERMINAL_RIF}: ${row.COUNT} obligaciones`);
    });

    // Mostrar obligaciones vencidas
    console.log('\n⚠️ Obligaciones vencidas...');
    const vencidasResult = await sequelize.query(`
      SELECT ID, CODIGO_OBLIGACION, TIPO_IMPUESTO, DESCRIPCION, 
             TO_CHAR(FECHA_LIMITE, 'DD/MM/YYYY') as FECHA_LIMITE, 
             PRIORIDAD, ESTADO
      FROM OBLIGACIONES_TRIBUTARIAS 
      WHERE FECHA_LIMITE < SYSDATE AND ESTADO = 'PENDIENTE'
      ORDER BY FECHA_LIMITE DESC
      FETCH FIRST 5 ROWS ONLY
    `);

    if (vencidasResult[0].length > 0) {
      console.log('Obligaciones vencidas:');
      vencidasResult[0].forEach((row, index) => {
        console.log(`${index + 1}. ${row.CODIGO_OBLIGACION} - ${row.TIPO_IMPUESTO}`);
        console.log(`   Descripción: ${row.DESCRIPCION}`);
        console.log(`   Fecha límite: ${row.FECHA_LIMITE} (VENCIDA)`);
        console.log(`   Prioridad: ${row.PRIORIDAD} | Estado: ${row.ESTADO}`);
        console.log('');
      });
    } else {
      console.log('   No hay obligaciones vencidas.');
    }

    // Mostrar resumen de tipos de contribuyentes
    console.log('\n👥 Tipos de contribuyentes afectados...');
    const contribuyenteResult = await sequelize.query(`
      SELECT TIPO_CONTRIBUYENTE, COUNT(*) as count 
      FROM OBLIGACIONES_TRIBUTARIAS 
      GROUP BY TIPO_CONTRIBUYENTE 
      ORDER BY count DESC
    `);
    
    contribuyenteResult[0].forEach(row => {
      console.log(`   - ${row.TIPO_CONTRIBUYENTE}: ${row.COUNT} obligaciones`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

verifyObligacionesData(); 