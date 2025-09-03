const oracledb = require('oracledb');

// Configuración de Oracle
const dbConfig = {
  user: 'CGBRITO',
  password: 'cgkbrito',
  connectString: '172.16.32.73:1521/DWREPO',
  schema: 'CGBRITO'
};

// Función para generar UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Función para generar username único basado en email
function generateUsername(email, nombre, apellido) {
  // Intentar usar la parte local del email
  let username = email.split('@')[0];
  
  // Si el username es muy corto, usar nombre.apellido
  if (username.length < 3) {
    username = `${nombre.toLowerCase()}.${apellido.toLowerCase()}`;
  }
  
  // Limpiar caracteres especiales y espacios
  username = username.replace(/[^a-zA-Z0-9]/g, '');
  
  return username;
}

// Función para crear usuario ejecutivo individual
async function createEjecutivoUser(ejecutivo, connection) {
  try {
    const { ID: ejecutivoId, CEDULA, NOMBRE, APELLIDO, EMAIL } = ejecutivo;
    
    console.log(`\n🔄 Procesando ejecutivo: ${NOMBRE} ${APELLIDO} (${EMAIL})`);
    
    // Generar username único
    let username = generateUsername(EMAIL, NOMBRE, APELLIDO);
    let counter = 1;
    let finalUsername = username;
    
    // Verificar que el username sea único
    while (true) {
      const existingUser = await connection.execute(
        'SELECT ID FROM CGBRITO.USERS WHERE USERNAME = :username',
        [finalUsername]
      );
      
      if (existingUser.rows.length === 0) {
        break; // Username único encontrado
      }
      
      // Agregar número al username si ya existe
      finalUsername = `${username}${counter}`;
      counter++;
    }
    
    console.log(`   📝 Username generado: ${finalUsername}`);
    
    // Verificar que no exista usuario con ese email
    const existingEmail = await connection.execute(
      'SELECT ID FROM CGBRITO.USERS WHERE EMAIL = :email',
      [EMAIL]
    );
    
    if (existingEmail.rows.length > 0) {
      console.log(`   ⚠️  Ya existe usuario con email: ${EMAIL}`);
      return { success: false, reason: 'Email ya existe en usuarios' };
    }
    
    // Hash de la contraseña por defecto
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('venezuela1', 10);
    
    // Generar UUID para el usuario
    const userId = generateUUID();
    
    // Crear el usuario
    await connection.execute(`
      INSERT INTO CGBRITO.USERS (
        ID, USERNAME, EMAIL, PASSWORD_HASH, 
        FIRST_NAME, LAST_NAME, ROLE_ID, STATUS, 
        CREATED_AT, UPDATED_AT
      ) VALUES (
        :id, :username, :email, :passwordHash, 
        :firstName, :lastName, 2, 'active', 
        SYSDATE, SYSDATE
      )
    `, {
      id: userId,
      username: finalUsername,
      email: EMAIL,
      passwordHash: passwordHash,
      firstName: NOMBRE,
      lastName: APELLIDO
    });
    
    console.log(`   ✅ Usuario creado con ID: ${userId}`);
    
    // Actualizar la tabla EJECUTIVOS con el USER_ID
    await connection.execute(`
      UPDATE CGBRITO.EJECUTIVOS 
      SET USER_ID = :userId, UPDATED_AT = SYSDATE 
      WHERE ID = :ejecutivoId
    `, {
      userId: userId,
      ejecutivoId: ejecutivoId
    });
    
    console.log(`   🔗 Ejecutivo vinculado con usuario`);
    
    // Confirmar transacción
    await connection.commit();
    console.log(`   💾 Transacción confirmada`);
    
    return { 
      success: true, 
      userId, 
      username: finalUsername,
      ejecutivoId 
    };
    
  } catch (error) {
    console.error(`   ❌ Error creando cuenta para ${ejecutivo.EMAIL}:`, error.message);
    // Rollback en caso de error
    await connection.rollback();
    console.log(`   🔄 Rollback realizado`);
    return { success: false, reason: error.message };
  }
}

// Función principal
async function createEjecutivosUsersIndividual() {
  let connection;
  
  try {
    console.log('🚀 INICIANDO CREACIÓN INDIVIDUAL DE USUARIOS PARA EJECUTIVOS');
    console.log('=' .repeat(70));
    
    // Conectar a Oracle
    console.log('\n🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Conexión exitosa a Oracle');
    
    // Configurar autocommit en false para control manual de transacciones
    connection.autoCommit = false;
    
    // Obtener todos los ejecutivos sin cuenta de usuario
    console.log('\n📋 Obteniendo ejecutivos sin cuenta de usuario...');
    const ejecutivos = await connection.execute(`
      SELECT e.ID, e.CEDULA, e.NOMBRE, e.APELLIDO, e.EMAIL, e.STATUS
      FROM CGBRITO.EJECUTIVOS e
      WHERE e.USER_ID IS NULL
      ORDER BY e.CREATED_AT ASC
    `);
    
    if (!ejecutivos.rows || ejecutivos.rows.length === 0) {
      console.log('✅ No hay ejecutivos pendientes de cuenta de usuario');
      return;
    }
    
    console.log(`📊 Total de ejecutivos a procesar: ${ejecutivos.rows.length}`);
    
    // Estadísticas
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    // Procesar cada ejecutivo individualmente
    for (let i = 0; i < ejecutivos.rows.length; i++) {
      const row = ejecutivos.rows[i];
      const ejecutivo = {
        ID: row[0],
        CEDULA: row[1],
        NOMBRE: row[2],
        APELLIDO: row[3],
        EMAIL: row[4],
        STATUS: row[5]
      };
      
      console.log(`\n📝 Procesando ejecutivo ${i + 1} de ${ejecutivos.rows.length}`);
      
      const result = await createEjecutivoUser(ejecutivo, connection);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Pequeña pausa entre usuarios
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Resumen final
    console.log('\n' + '=' .repeat(70));
    console.log('📊 RESUMEN FINAL');
    console.log('=' .repeat(70));
    console.log(`✅ Cuentas creadas exitosamente: ${successCount}`);
    console.log(`❌ Errores encontrados: ${errorCount}`);
    console.log(`📋 Total procesados: ${ejecutivos.rows.length}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  EJECUTIVOS CON ERRORES:');
      results.forEach((result, index) => {
        if (!result.success) {
          const ejecutivo = {
            NOMBRE: ejecutivos.rows[index][2],
            APELLIDO: ejecutivos.rows[index][3]
          };
          console.log(`   - ${ejecutivo.NOMBRE} ${ejecutivo.APELLIDO}: ${result.reason}`);
        }
      });
    }
    
    // Verificar estado final
    console.log('\n🔍 VERIFICANDO ESTADO FINAL...');
    const totalEjecutivos = await connection.execute('SELECT COUNT(*) FROM CGBRITO.EJECUTIVOS');
    const ejecutivosConCuenta = await connection.execute(`
      SELECT COUNT(*) FROM CGBRITO.EJECUTIVOS e
      WHERE e.USER_ID IS NOT NULL
    `);
    
    const total = totalEjecutivos.rows[0][0];
    const conCuenta = ejecutivosConCuenta.rows[0][0];
    const sinCuenta = total - conCuenta;
    
    console.log(`📊 Total ejecutivos: ${total}`);
    console.log(`✅ Con cuenta de usuario: ${conCuenta}`);
    console.log(`❌ Sin cuenta de usuario: ${sinCuenta}`);
    
    if (sinCuenta === 0) {
      console.log('\n🎉 ¡TODOS LOS EJECUTIVOS TIENEN CUENTA DE USUARIO!');
    } else {
      console.log(`\n⚠️  Aún quedan ${sinCuenta} ejecutivos sin cuenta`);
    }
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO:', error);
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔒 Conexión a base de datos cerrada');
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  createEjecutivosUsersIndividual()
    .then(() => {
      console.log('\n✨ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { createEjecutivosUsersIndividual };
