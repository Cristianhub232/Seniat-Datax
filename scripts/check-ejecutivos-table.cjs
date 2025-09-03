const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function checkEjecutivosTable() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar estructura de la tabla EJECUTIVOS
    console.log('\n📋 ESTRUCTURA DE LA TABLA EJECUTIVOS:');
    console.log('=' .repeat(50));
    
    const ejecutivosStructure = await connection.execute(`
      SELECT column_name, data_type, data_length, nullable
      FROM user_tab_columns 
      WHERE table_name = 'EJECUTIVOS'
      ORDER BY column_id
    `);
    
    console.log('Columnas de la tabla EJECUTIVOS:');
    ejecutivosStructure.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]}(${row[2]}) ${row[3] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Contar total de ejecutivos
    console.log('\n📊 CONTENIDO DE LA TABLA EJECUTIVOS:');
    console.log('=' .repeat(50));
    
    const totalEjecutivos = await connection.execute('SELECT COUNT(*) FROM CGBRITO.EJECUTIVOS');
    console.log(`Total de ejecutivos: ${totalEjecutivos.rows[0][0]}`);
    
    // Ver algunos ejecutivos de ejemplo
    console.log('\n👥 EJEMPLOS DE EJECUTIVOS:');
    console.log('=' .repeat(50));
    
    const sampleEjecutivos = await connection.execute(`
      SELECT ID, CEDULA, NOMBRE, APELLIDO, EMAIL, STATUS, CREATED_AT
      FROM CGBRITO.EJECUTIVOS
      ORDER BY CREATED_AT DESC
      FETCH FIRST 5 ROWS ONLY
    `);
    
    sampleEjecutivos.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row[0]}`);
      console.log(`   Cédula: ${row[1]}`);
      console.log(`   Nombre: ${row[2]} ${row[3]}`);
      console.log(`   Email: ${row[4]}`);
      console.log(`   Estado: ${row[5]}`);
      console.log(`   Creado: ${row[6]}`);
      console.log('');
    });
    
    // Verificar si existe alguna relación con la tabla USERS
    console.log('🔍 VERIFICANDO RELACIÓN CON TABLA USERS:');
    console.log('=' .repeat(50));
    
    // Intentar hacer un JOIN para ver si hay alguna relación
    try {
      const relacionEjecutivosUsers = await connection.execute(`
        SELECT e.ID as ejecutivo_id, e.EMAIL as ejecutivo_email, 
               u.ID as user_id, u.USERNAME as user_username
        FROM CGBRITO.EJECUTIVOS e
        LEFT JOIN CGBRITO.USERS u ON e.EMAIL = u.EMAIL
        ORDER BY e.CREATED_AT DESC
        FETCH FIRST 10 ROWS ONLY
      `);
      
      console.log('Relación EJECUTIVOS ↔ USERS (por email):');
      relacionEjecutivosUsers.rows.forEach(row => {
        const ejecutivoId = row[0];
        const ejecutivoEmail = row[1];
        const userId = row[2];
        const userUsername = row[3];
        
        if (userId) {
          console.log(`   ✅ Ejecutivo ${ejecutivoId} (${ejecutivoEmail}) → Usuario ${userId} (${userUsername})`);
        } else {
          console.log(`   ❌ Ejecutivo ${ejecutivoId} (${ejecutivoEmail}) → Sin usuario`);
        }
      });
      
    } catch (error) {
      console.log('❌ Error al verificar relación:', error.message);
    }
    
    // Verificar si hay ejecutivos con emails que coincidan con usuarios existentes
    console.log('\n🔍 VERIFICANDO COINCIDENCIAS DE EMAIL:');
    console.log('=' .repeat(50));
    
    const coincidenciasEmail = await connection.execute(`
      SELECT e.EMAIL, COUNT(*) as count
      FROM CGBRITO.EJECUTIVOS e
      WHERE EXISTS (SELECT 1 FROM CGBRITO.USERS u WHERE u.EMAIL = e.EMAIL)
      GROUP BY e.EMAIL
    `);
    
    if (coincidenciasEmail.rows.length > 0) {
      console.log(`Emails que coinciden entre EJECUTIVOS y USERS: ${coincidenciasEmail.rows.length}`);
      coincidenciasEmail.rows.forEach(row => {
        console.log(`   - ${row[0]}: ${row[1]} coincidencias`);
      });
    } else {
      console.log('❌ No hay coincidencias de email entre EJECUTIVOS y USERS');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔒 Conexión a base de datos cerrada');
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  checkEjecutivosTable()
    .then(() => {
      console.log('\n✨ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { checkEjecutivosTable };
