const oracledb = require('oracledb');

async function testEjecutivoLimitReal() {
  console.log('🔍 Probando límite de 1000 contribuyentes con datos reales...\\n');
  
  let connection;
  
  try {
    // Configurar Oracle
    oracledb.initOracleClient();
    
    // Conectar a la base de datos
    connection = await oracledb.getConnection({
      user: process.env.DB_USER || 'CGBRITO',
      password: process.env.DB_PASSWORD || 'CGBRITO',
      connectString: process.env.DB_CONNECTION_STRING || 'localhost:1521/XE'
    });
    
    console.log('✅ Conexión a base de datos establecida');
    
    // 1. Verificar usuarios con rol Ejecutivo
    console.log('\\n1. Verificando usuarios con rol Ejecutivo...');
    const ejecutivosResult = await connection.execute(`
      SELECT ID, USERNAME, FIRST_NAME, LAST_NAME, ROLE 
      FROM CGBRITO.USERS 
      WHERE ROLE = 'Ejecutivo'
      ORDER BY USERNAME
    `);
    
    const ejecutivos = ejecutivosResult.rows;
    console.log(`📊 Encontrados ${ejecutivos.length} usuarios con rol Ejecutivo:`);
    
    ejecutivos.forEach((ejecutivo, index) => {
      console.log(`   ${index + 1}. ${ejecutivo[1]} (${ejecutivo[2]} ${ejecutivo[3]}) - ID: ${ejecutivo[0]}`);
    });
    
    if (ejecutivos.length === 0) {
      console.log('⚠️  No hay usuarios con rol Ejecutivo para probar');
      return;
    }
    
    // 2. Verificar contribuyentes por cada ejecutivo
    console.log('\\n2. Verificando contribuyentes por ejecutivo...');
    
    for (const ejecutivo of ejecutivos) {
      const userId = ejecutivo[0];
      const username = ejecutivo[1];
      const fullName = `${ejecutivo[2]} ${ejecutivo[3]}`;
      
      const countResult = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM CGBRITO.CARTERA_CONTRIBUYENTES 
        WHERE USUARIO_ID = :userId
      `, { userId });
      
      const count = countResult.rows[0][0];
      const availableSlots = 1000 - count;
      
      console.log(`\\n👤 ${fullName} (${username}):`);
      console.log(`   📊 Contribuyentes actuales: ${count}`);
      console.log(`   📊 Espacios disponibles: ${availableSlots}`);
      
      if (count >= 1000) {
        console.log(`   🚫 LÍMITE ALCANZADO - No puede agregar más contribuyentes`);
      } else if (count >= 950) {
        console.log(`   ⚠️  CERCANO AL LÍMITE - Solo ${availableSlots} espacios disponibles`);
      } else {
        console.log(`   ✅ Puede agregar hasta ${availableSlots} contribuyentes más`);
      }
      
      // Mostrar algunos contribuyentes de ejemplo
      if (count > 0) {
        const sampleResult = await connection.execute(`
          SELECT RIF, TIPO_CONTRIBUYENTE, CREATED_AT 
          FROM CGBRITO.CARTERA_CONTRIBUYENTES 
          WHERE USUARIO_ID = :userId 
          ORDER BY CREATED_AT DESC 
          FETCH FIRST 3 ROWS ONLY
        `, { userId });
        
        console.log(`   📋 Últimos 3 contribuyentes:`);
        sampleResult.rows.forEach((row, index) => {
          console.log(`      ${index + 1}. ${row[0]} (${row[1]}) - ${row[2]}`);
        });
      }
    }
    
    // 3. Verificar estadísticas generales
    console.log('\\n3. Estadísticas generales de cartera de contribuyentes...');
    
    const statsResult = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT USUARIO_ID) as usuarios_unicos,
        SUM(CASE WHEN TIPO_CONTRIBUYENTE = 'NATURAL' THEN 1 ELSE 0 END) as naturales,
        SUM(CASE WHEN TIPO_CONTRIBUYENTE = 'JURIDICO' THEN 1 ELSE 0 END) as juridicos,
        SUM(CASE WHEN TIPO_CONTRIBUYENTE = 'GOBIERNO' THEN 1 ELSE 0 END) as gobierno,
        SUM(CASE WHEN TIPO_CONTRIBUYENTE = 'CONSEJO_COMUNAL' THEN 1 ELSE 0 END) as consejos_comunales
      FROM CGBRITO.CARTERA_CONTRIBUYENTES
    `);
    
    const stats = statsResult.rows[0];
    console.log(`📊 Total de contribuyentes: ${stats[0]}`);
    console.log(`👥 Usuarios únicos: ${stats[1]}`);
    console.log(`👤 Naturales: ${stats[2]}`);
    console.log(`🏢 Jurídicos: ${stats[3]}`);
    console.log(`🏛️  Gobierno: ${stats[4]}`);
    console.log(`🏘️  Consejos Comunales: ${stats[5]}`);
    
    // 4. Verificar usuarios que están cerca del límite
    console.log('\\n4. Usuarios cerca del límite de 1000 contribuyentes...');
    
    const nearLimitResult = await connection.execute(`
      SELECT 
        u.USERNAME,
        u.FIRST_NAME,
        u.LAST_NAME,
        COUNT(c.ID) as contribuyentes_count,
        (1000 - COUNT(c.ID)) as espacios_disponibles
      FROM CGBRITO.USERS u
      LEFT JOIN CGBRITO.CARTERA_CONTRIBUYENTES c ON u.ID = c.USUARIO_ID
      WHERE u.ROLE = 'Ejecutivo'
      GROUP BY u.ID, u.USERNAME, u.FIRST_NAME, u.LAST_NAME
      HAVING COUNT(c.ID) >= 900
      ORDER BY COUNT(c.ID) DESC
    `);
    
    const nearLimitUsers = nearLimitResult.rows;
    
    if (nearLimitUsers.length > 0) {
      console.log(`⚠️  ${nearLimitUsers.length} usuarios cerca del límite:`);
      nearLimitUsers.forEach((user, index) => {
        const status = user[3] >= 1000 ? '🚫 LÍMITE ALCANZADO' : '⚠️  CERCANO AL LÍMITE';
        console.log(`   ${index + 1}. ${user[0]} (${user[1]} ${user[2]}): ${user[3]} contribuyentes - ${user[4]} espacios disponibles - ${status}`);
      });
    } else {
      console.log('✅ Ningún usuario está cerca del límite de 1000 contribuyentes');
    }
    
    console.log('\\n🎯 Prueba de límite de contribuyentes completada!');
    console.log('\\n📋 Resumen:');
    console.log('✅ Verificación de usuarios con rol Ejecutivo');
    console.log('✅ Conteo de contribuyentes por usuario');
    console.log('✅ Cálculo de espacios disponibles');
    console.log('✅ Identificación de usuarios cerca del límite');
    console.log('✅ Estadísticas generales de la cartera');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\\n✅ Conexión a base de datos cerrada');
      } catch (err) {
        console.error('❌ Error cerrando conexión:', err.message);
      }
    }
  }
}

testEjecutivoLimitReal(); 