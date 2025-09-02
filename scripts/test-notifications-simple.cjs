const http = require('http');

function testNotificationsAPI() {
  console.log('🧪 Probando API de notificaciones...\n');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/notifications',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📥 Respuesta completa:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('Respuesta raw:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error en la petición:', error.message);
  });

  req.end();
}

testNotificationsAPI(); 