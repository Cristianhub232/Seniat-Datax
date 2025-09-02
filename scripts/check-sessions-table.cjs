const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function checkSessionsTable() {
  let connection;
  
  try {
    // Configuración de conexión
    const config = {
      user: process.env.ORACLE_USERNAME || 'CGBRITO',
      password: process.env.ORACLE_PASSWORD || 'cgkbrito',
      connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`,
    };

    console.log('🔍 Conectando a Oracle...');
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa');

    // Verificar la estructura de la tabla SESSIONS
    console.log('\n🔍 Estructura de la tabla SESSIONS:');
    const structureResult = await connection.execute(`
      SELECT column_name, data_type, nullable, data_default, column_id
      FROM user_tab_columns 
      WHERE table_name = 'SESSIONS' 
      ORDER BY column_id
    `);
    
    if (structureResult.rows && structureResult.rows.length > 0) {
      structureResult.rows.forEach(col => {
        console.log(`   - ${col[0]} (${col[1]}, ${col[2] === 'Y' ? 'NULL' : 'NOT NULL'}, ID: ${col[4]})`);
      });
    } else {
      console.log('   No se encontró la tabla SESSIONS');
      return;
    }

    // Verificar las restricciones de la tabla SESSIONS con más detalle
    console.log('\n🔒 Restricciones de la tabla SESSIONS:');
    const constraintsResult = await connection.execute(`
      SELECT c.constraint_name, c.constraint_type, c.search_condition, cc.column_name
      FROM user_constraints c
      LEFT JOIN user_cons_columns cc ON c.constraint_name = cc.constraint_name
      WHERE c.table_name = 'SESSIONS'
      ORDER BY c.constraint_name, cc.position
    `);
    
    if (constraintsResult.rows && constraintsResult.rows.length > 0) {
      let currentConstraint = '';
      constraintsResult.rows.forEach(constraint => {
        if (constraint[0] !== currentConstraint) {
          currentConstraint = constraint[0];
          console.log(`   - ${constraint[0]} (${constraint[1]})`);
          if (constraint[2]) {
            console.log(`     Condición: ${constraint[2]}`);
          }
        }
        if (constraint[3]) {
          console.log(`     Columna: ${constraint[3]}`);
        }
      });
    } else {
      console.log('   No se encontraron restricciones');
    }

    // Verificar si hay datos en la tabla SESSIONS
    console.log('\n📊 Datos en la tabla SESSIONS:');
    const dataResult = await connection.execute(`
      SELECT COUNT(*) as count
      FROM CGBRITO.SESSIONS
    `);
    
    if (dataResult.rows && dataResult.rows.length > 0) {
      console.log(`   Total de sesiones: ${dataResult.rows[0][0]}`);
    }

    // Verificar si hay sesiones duplicadas que puedan causar problemas
    console.log('\n🔍 Verificando posibles duplicados en SESSIONS:');
    const duplicatesResult = await connection.execute(`
      SELECT USER_ID, COUNT(*) as count
      FROM CGBRITO.SESSIONS
      GROUP BY USER_ID
      HAVING COUNT(*) > 1
    `);
    
    if (duplicatesResult.rows && duplicatesResult.rows.length > 0) {
      console.log('   ⚠️ Usuarios con múltiples sesiones:');
      duplicatesResult.rows.forEach(dup => {
        console.log(`     - Usuario ${dup[0]}: ${dup[1]} sesiones`);
      });
    } else {
      console.log('   ✅ No hay sesiones duplicadas');
    }

    // Verificar la secuencia si existe
    console.log('\n🔢 Verificando secuencias para SESSIONS:');
    const sequencesResult = await connection.execute(`
      SELECT sequence_name, last_number
      FROM user_sequences 
      WHERE sequence_name LIKE '%SESSIONS%' OR sequence_name LIKE '%SESSION%'
    `);
    
    if (sequencesResult.rows && sequencesResult.rows.length > 0) {
      sequencesResult.rows.forEach(seq => {
        console.log(`   - ${seq[0]}: último número ${seq[1]}`);
      });
    } else {
      console.log('   No se encontraron secuencias relacionadas con SESSIONS');
    }

    // Verificar si hay problemas con el campo ID
    console.log('\n🔍 Verificando campo ID de SESSIONS:');
    const idResult = await connection.execute(`
      SELECT ID, LENGTH(ID) as id_length
      FROM CGBRITO.SESSIONS
      WHERE ROWNUM <= 5
      ORDER BY CREATED_AT DESC
    `);
    
    if (idResult.rows && idResult.rows.length > 0) {
      console.log('   Últimos IDs de sesión:');
      idResult.rows.forEach(row => {
        console.log(`     - ${row[0]} (longitud: ${row[1]})`);
      });
    } else {
      console.log('   No hay sesiones para verificar IDs');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\n🔌 Conexión cerrada');
      } catch (error) {
        console.error('Error cerrando conexión:', error);
      }
    }
  }
}

checkSessionsTable();
