const http = require('http');

async function testCreateNotification() {
  console.log('🧪 Probando creación de notificación...\n');

  const baseUrl = 'http://localhost:3001';

  try {
    // 1. Verificar que la API funciona
    console.log('1. ✅ Verificando API de notificaciones...');
    const apiResponse = await makeRequest(`${baseUrl}/api/notifications`);
    
    if (apiResponse.success) {
      console.log(`   📊 Total de notificaciones actuales: ${apiResponse.stats.total}`);
    } else {
      console.log('   ❌ Error en la API');
      return;
    }

    // 2. Probar creación de notificación (esto fallará sin autenticación)
    console.log('\n2. 📝 Probando creación de notificación...');
    
    const notificationData = {
      title: 'Notificación de Prueba',
      message: 'Esta es una notificación de prueba creada desde el script.',
      type: 'info',
      priority: 'medium',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    };

    try {
      const createResponse = await makePostRequest(`${baseUrl}/api/notifications`, notificationData);
      console.log('   ✅ Notificación creada exitosamente');
      console.log('   📋 Datos de la notificación:', createResponse.data);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('   ⚠️  Error de autenticación/autorización (esperado sin token)');
        console.log('   💡 Esto es normal - necesitas estar autenticado como admin');
      } else {
        console.log('   ❌ Error inesperado:', error.message);
      }
    }

    // 3. Verificar notificaciones después del intento
    console.log('\n3. 📊 Verificando notificaciones después del intento...');
    const finalResponse = await makeRequest(`${baseUrl}/api/notifications`);
    
    if (finalResponse.success) {
      console.log(`   📊 Total de notificaciones: ${finalResponse.stats.total}`);
      console.log(`   📝 Notificaciones devueltas: ${finalResponse.data.length}`);
    }

    // 4. Instrucciones para probar manualmente
    console.log('\n4. 📋 Para probar la creación manualmente:');
    console.log('   1. Inicia sesión con usuario admin (ejemplo, cristian, admin)');
    console.log('   2. Ve a http://localhost:3001/notificaciones');
    console.log('   3. Haz clic en "Nueva Notificación"');
    console.log('   4. Completa el formulario y guarda');
    console.log('   5. Verifica que la notificación aparezca en la lista');

    console.log('\n🎉 ¡Prueba completada!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.headers['content-type']?.includes('application/json')) {
            resolve(JSON.parse(data));
          } else {
            resolve(data);
          }
        } catch (error) {
          resolve(data);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          } else {
            resolve(JSON.parse(responseData));
          }
        } catch (error) {
          reject(new Error(`Error parsing response: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Ejecutar prueba
testCreateNotification(); 