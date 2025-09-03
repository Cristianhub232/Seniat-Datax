const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

async function checkRolePermissionsStructure() {
  let connection;
  
  try {
    console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLA ROLE_PERMISSIONS');
    console.log('=' .repeat(60));
    
    // Conectar a Oracle
    console.log('\n🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Verificar estructura de la tabla
    console.log('\n📋 ESTRUCTURA DE LA TABLA ROLE_PERMISSIONS:');
    console.log('=' .repeat(50));
    
    const structure = await connection.execute(`
      SELECT column_name, data_type, data_length, nullable
      FROM user_tab_columns 
      WHERE table_name = 'ROLE_PERMISSIONS'
      ORDER BY column_id
    `);
    
    console.log('Columnas de la tabla ROLE_PERMISSIONS:');
    structure.rows.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]}(${row[2]}) ${row[3] === 'Y' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar si hay datos
    console.log('\n📊 CONTEO DE REGISTROS:');
    console.log('=' .repeat(50));
    
    const count = await connection.execute('SELECT COUNT(*) FROM CGBRITO.ROLE_PERMISSIONS');
    console.log(`Total de registros: ${count.rows[0][0]}`);
    
    // Verificar algunos registros de ejemplo
    if (count.rows[0][0] > 0) {
      console.log('\n👥 EJEMPLOS DE REGISTROS:');
      console.log('=' .repeat(50));
      
      const examples = await connection.execute(`
        SELECT rp.ID, r.NAME as ROLE_NAME, p.NAME as PERMISSION_NAME
        FROM CGBRITO.ROLE_PERMISSIONS rp
        JOIN CGBRITO.ROLES r ON rp.ROLE_ID = r.ID
        JOIN CGBRITO.PERMISSIONS p ON rp.PERMISSION_ID = p.ID
        WHERE ROWNUM <= 5
        ORDER BY rp.ID
      `);
      
      examples.rows.forEach(row => {
        console.log(`   - ID: ${row[0]}, Rol: ${row[1]}, Permiso: ${row[2]}`);
      });
    }
    
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
  checkRolePermissionsStructure()
    .then(() => {
      console.log('\n✨ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { checkRolePermissionsStructure };
