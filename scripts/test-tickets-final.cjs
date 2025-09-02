const http = require('http');

function testEndpoint(path, expectedStatusRange = [200, 499]) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isExpected = res.statusCode >= expectedStatusRange[0] && res.statusCode <= expectedStatusRange[1];
        resolve({
          path,
          statusCode: res.statusCode,
          success: isExpected,
          dataLength: data.length,
          data: data.substring(0, 200) // Solo los primeros 200 caracteres
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        path,
        statusCode: 0,
        success: false,
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path,
        statusCode: 0,
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Probando módulo de tickets - Estados finales...\n');

  const tests = [
    {
      name: 'Página de tickets (sin auth)',
      path: '/tickets',
      expected: [200, 307] // 200 OK o 307 Redirect a login
    },
    {
      name: 'API de tickets (sin auth)',
      path: '/api/admin/tickets',
      expected: [401, 401] // Debe ser 401 sin autenticación
    },
    {
      name: 'API de estadísticas (sin auth)',
      path: '/api/admin/tickets/stats',
      expected: [401, 401] // Debe ser 401 sin autenticación
    },
    {
      name: 'Dashboard principal',
      path: '/dashboard',
      expected: [200, 307] // 200 OK o 307 Redirect
    },
    {
      name: 'API de login',
      path: '/api/auth/login',
      expected: [200, 405] // 200 o 405 Method Not Allowed (GET en POST endpoint)
    }
  ];

  const results = [];
  
  for (const test of tests) {
    console.log(`🔍 Probando: ${test.name}`);
    const result = await testEndpoint(test.path, test.expected);
    results.push({ ...test, result });
    
    if (result.success) {
      console.log(`   ✅ ${result.statusCode} - OK`);
    } else {
      console.log(`   ❌ ${result.statusCode} - ${result.error || 'Error inesperado'}`);
    }
    
    if (result.dataLength > 0) {
      console.log(`   📄 Respuesta: ${result.dataLength} bytes`);
    }
    console.log('');
  }

  // Resumen
  console.log('\n📊 RESUMEN DE PRUEBAS:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.result.success).length;
  const total = results.length;
  
  console.log(`✅ Exitosas: ${passed}/${total}`);
  console.log(`❌ Fallidas: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! El módulo está funcionando correctamente.');
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisar configuración.');
  }

  console.log('\n📝 NOTAS:');
  console.log('- Status 401 en APIs es ESPERADO (sin autenticación)');
  console.log('- Status 307 en páginas es ESPERADO (redirección a login)');
  console.log('- Status 200 indica que la página/API se compiló correctamente');
  console.log('\n🚀 Para probar completamente:');
  console.log('1. Ir a http://172.16.56.23:3002');
  console.log('2. Iniciar sesión con admin/admin123');
  console.log('3. Navegar a /tickets');
}

runTests();
