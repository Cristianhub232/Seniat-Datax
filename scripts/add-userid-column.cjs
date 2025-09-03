const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function addUserIdColumn() {
  let connection;
  
  try {
    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar si la columna USER_ID ya existe
    console.log('\n🔍 VERIFICANDO SI EXISTE COLUMNA USER_ID:');
    console.log('=' .repeat(50));
    
    const columnExists = await connection.execute(`
      SELECT column_name 
      FROM user_tab_columns 
      WHERE table_name = 'EJECUTIVOS' AND column_name = 'USER_ID'
    `);
    
    if (columnExists.rows.length > 0) {
      console.log('✅ La columna USER_ID ya existe en la tabla EJECUTIVOS');
      return;
    }
    
    console.log('❌ La columna USER_ID NO existe. Procediendo a crearla...');
    
    // Agregar la columna USER_ID
    console.log('\n🔧 AGREGANDO COLUMNA USER_ID:');
    console.log('=' .repeat(50));
    
    await connection.execute(`
      ALTER TABLE CGBRITO.EJECUTIVOS 
      ADD USER_ID VARCHAR2(36)
    `);
    
    console.log('✅ Columna USER_ID agregada exitosamente');
    
    // Agregar comentario a la columna
    try {
      await connection.execute(`
        COMMENT ON COLUMN CGBRITO.EJECUTIVOS.USER_ID IS 'Referencia al ID de la tabla USERS'
      `);
      console.log('✅ Comentario agregado a la columna USER_ID');
    } catch (error) {
      console.log('⚠️  No se pudo agregar comentario (no crítico):', error.message);
    }
    
    // Verificar la nueva estructura
    console.log('\n📋 NUEVA ESTRUCTURA DE LA TABLA EJECUTIVOS:');
    console.log('=' .repeat(50));
    
    const newStructure = await connection.execute(`
      SELECT column_name, data_type, data_length, nullable
      FROM user_tab_columns 
      WHERE table_name = 'EJECUTIVOS'
      ORDER BY column_id
    `);
    
    console.log('Columnas de la tabla EJECUTIVOS:');
    newStructure.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]}(${row[2]}) ${row[3] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar que la columna se agregó correctamente
    const verifyColumn = await connection.execute(`
      SELECT USER_ID FROM CGBRITO.EJECUTIVOS WHERE ROWNUM = 1
    `);
    
    console.log('\n✅ Verificación exitosa: La columna USER_ID está disponible');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔒 Conexión a base de datos cerrada');
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  addUserIdColumn()
    .then(() => {
      console.log('\n✨ Columna USER_ID agregada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { addUserIdColumn };
