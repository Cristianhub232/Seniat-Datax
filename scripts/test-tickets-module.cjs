const http = require('http');

function testTicketsModule() {
  console.log('🧪 Probando módulo de tickets...');
  
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/tickets',
    method: 'GET',
    headers: {
      'User-Agent': 'Test-Script'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📡 Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Módulo de tickets funcionando correctamente');
        console.log(`📄 Respuesta recibida (${data.length} bytes)`);
      } else if (res.statusCode === 307) {
        console.log('✅ Redirección detectada (normal en Next.js)');
        console.log('📍 URL de redirección:', res.headers.location);
      } else {
        console.log(`⚠️ Respuesta inesperada: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error de conexión:', error.message);
  });

  req.setTimeout(5000, () => {
    console.error('❌ Timeout de conexión');
    req.destroy();
  });

  req.end();
}

// Ejecutar la prueba
testTicketsModule();
