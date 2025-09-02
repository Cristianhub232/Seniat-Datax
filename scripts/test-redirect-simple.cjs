const http = require('http');

function testRedirect() {
  console.log('🧪 Probando redirección del splash screen...');
  console.log('📍 URL: http://localhost:3001');
  
  // Opciones para la petición HTTP
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Tamaño de respuesta: ${data.length} bytes`);
      
      // Verificar si la respuesta contiene elementos del splash screen
      if (data.includes('SplashScreen') || data.includes('splash-title')) {
        console.log('✅ SUCCESS: Splash screen detectado en la respuesta');
      } else {
        console.log('❌ FAIL: No se detectó el splash screen');
      }
      
      // Verificar si hay redirección
      if (data.includes('window.location.href') || data.includes('router.push')) {
        console.log('✅ SUCCESS: Código de redirección detectado');
      } else {
        console.log('❌ FAIL: No se detectó código de redirección');
      }
      
      console.log('\n💡 Para probar la redirección completa:');
      console.log('   1. Abre http://localhost:3001 en tu navegador');
      console.log('   2. Espera 5 segundos a que termine el splash screen');
      console.log('   3. Verifica que te redirija a /login');
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error en la petición:', error.message);
  });

  req.end();
}

// Ejecutar la prueba
testRedirect();
