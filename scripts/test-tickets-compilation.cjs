const http = require('http');

function testTicketsCompilation() {
  console.log('🧪 Probando compilación del módulo de tickets...');
  
  const testUrls = [
    '/tickets',
    '/api/admin/tickets',
    '/api/admin/tickets/stats'
  ];

  testUrls.forEach(url => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: url,
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${url}: ${res.statusCode}`);
      
      if (res.statusCode === 500) {
        console.log(`❌ Error interno en ${url}`);
      } else if (res.statusCode === 307) {
        console.log(`🔄 Redirección normal en ${url}`);
      } else if (res.statusCode === 200) {
        console.log(`✅ Respuesta exitosa en ${url}`);
      }
    });

    req.on('error', (error) => {
      console.error(`❌ Error de conexión en ${url}:`, error.message);
    });

    req.setTimeout(5000, () => {
      console.error(`❌ Timeout en ${url}`);
      req.destroy();
    });

    req.end();
  });
}

// Ejecutar la prueba
setTimeout(testTicketsCompilation, 2000); // Esperar 2 segundos para que la app esté lista
