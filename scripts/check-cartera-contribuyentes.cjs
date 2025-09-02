const oracledb = require('oracledb');

// Configuración de la base de datos
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  poolMin: 10,
  poolMax: 10,
  poolIncrement: 0
};

async function checkCarteraContribuyentes() {
  let connection;
  
  try {
    console.log('🔍 Verificando tabla CARTERA_CONTRIBUYENTES...\n');
    
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    connection = await oracledb.getConnection();
    
    // Verificar si la tabla existe
    console.log('1. Verificando existencia de la tabla...');
    const tableExists = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM USER_TABLES 
      WHERE TABLE_NAME = 'CARTERA_CONTRIBUYENTES'
    `);
    
    if (tableExists.rows[0][0] === 0) {
      console.log('❌ La tabla CARTERA_CONTRIBUYENTES NO existe');
      console.log('\n📋 Creando tabla CARTERA_CONTRIBUYENTES...');
      
      await connection.execute(`
        CREATE TABLE CARTERA_CONTRIBUYENTES (
          ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          RIF VARCHAR2(10) NOT NULL UNIQUE,
          TIPO_CONTRIBUYENTE VARCHAR2(20) NOT NULL,
          USUARIO_ID NUMBER,
          CREATED_AT DATE DEFAULT SYSDATE,
          UPDATED_AT DATE DEFAULT SYSDATE
        )
      `);
      
      await connection.execute(`
        CREATE INDEX IDX_CARTERA_RIF ON CARTERA_CONTRIBUYENTES(RIF)
      `);
      
      await connection.execute(`
        CREATE INDEX IDX_CARTERA_TIPO ON CARTERA_CONTRIBUYENTES(TIPO_CONTRIBUYENTE)
      `);
      
      console.log('✅ Tabla CARTERA_CONTRIBUYENTES creada exitosamente');
    } else {
      console.log('✅ La tabla CARTERA_CONTRIBUYENTES existe');
    }
    
    // Verificar estructura de la tabla
    console.log('\n2. Verificando estructura de la tabla...');
    const columns = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_LENGTH
      FROM USER_TAB_COLUMNS 
      WHERE TABLE_NAME = 'CARTERA_CONTRIBUYENTES'
      ORDER BY COLUMN_ID
    `);
    
    console.log('📋 Columnas de la tabla:');
    columns.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]}(${row[3]}) ${row[2] === 'N' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Verificar cantidad de registros
    console.log('\n3. Verificando cantidad de registros...');
    const countResult = await connection.execute(`
      SELECT COUNT(*) as total FROM CARTERA_CONTRIBUYENTES
    `);
    
    const totalRecords = countResult.rows[0][0];
    console.log(`📊 Total de registros: ${totalRecords}`);
    
    if (totalRecords > 0) {
      // Mostrar algunos registros de ejemplo
      console.log('\n4. Mostrando registros de ejemplo...');
      const sampleRecords = await connection.execute(`
        SELECT RIF, TIPO_CONTRIBUYENTE, USUARIO_ID, CREATED_AT
        FROM CARTERA_CONTRIBUYENTES
        ORDER BY CREATED_AT DESC
        FETCH FIRST 5 ROWS ONLY
      `);
      
      console.log('📋 Registros de ejemplo:');
      sampleRecords.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. RIF: ${row[0]}, Tipo: ${row[1]}, Usuario: ${row[2]}, Fecha: ${row[3]}`);
      });
      
      // Estadísticas por tipo
      console.log('\n5. Estadísticas por tipo de contribuyente...');
      const stats = await connection.execute(`
        SELECT 
          TIPO_CONTRIBUYENTE,
          COUNT(*) as cantidad
        FROM CARTERA_CONTRIBUYENTES
        GROUP BY TIPO_CONTRIBUYENTE
        ORDER BY cantidad DESC
      `);
      
      console.log('📊 Distribución por tipo:');
      stats.rows.forEach(row => {
        console.log(`   - ${row[0]}: ${row[1]} registros`);
      });
    } else {
      console.log('\n📝 La tabla está vacía. Insertando datos de prueba...');
      
      // Insertar algunos datos de prueba
      const testRifs = [
        'V123456789',
        'J987654321',
        'E111222333',
        'G555666777',
        'C999888777'
      ];
      
      for (const rif of testRifs) {
        let tipo;
        switch (rif.charAt(0)) {
          case 'V':
          case 'E':
            tipo = 'NATURAL';
            break;
          case 'J':
            tipo = 'JURIDICO';
            break;
          case 'G':
            tipo = 'GOBIERNO';
            break;
          case 'C':
            tipo = 'CONSEJO_COMUNAL';
            break;
          default:
            tipo = 'NATURAL';
        }
        
        await connection.execute(`
          INSERT INTO CARTERA_CONTRIBUYENTES (RIF, TIPO_CONTRIBUYENTE, USUARIO_ID)
          VALUES (:rif, :tipo, 1)
        `, { rif, tipo });
      }
      
      await connection.commit();
      console.log('✅ Datos de prueba insertados exitosamente');
    }
    
    console.log('\n✅ Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error cerrando conexión:', err);
      }
    }
    
    try {
      await oracledb.getPool().close();
    } catch (err) {
      console.error('Error cerrando pool:', err);
    }
  }
}

// Ejecutar la verificación
checkCarteraContribuyentes(); 