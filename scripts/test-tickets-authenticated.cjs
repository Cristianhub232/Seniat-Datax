const http = require('http');

async function testTicketsAuthenticated() {
  console.log('🧪 Probando módulo de tickets con autenticación...');
  
  // Primero hacer login para obtener el token
  console.log('🔐 Iniciando sesión como admin...');
  
  const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  try {
    const loginResult = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);
              resolve(response);
            } catch (e) {
              reject(new Error('Respuesta de login inválida'));
            }
          } else {
            reject(new Error(`Login falló con status: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.write(loginData);
      req.end();
    });

    console.log('✅ Login exitoso');
    console.log('📄 Respuesta:', JSON.stringify(loginResult, null, 2));

    // Extraer cookies de la respuesta
    const cookies = loginResult.cookies || [];
    const authCookie = cookies.find(c => c.name === 'auth_token');
    
    if (!authCookie) {
      console.log('⚠️ No se encontró cookie de autenticación');
      return;
    }

    console.log('🍪 Cookie de autenticación obtenida');

    // Ahora probar las APIs autenticadas
    const testUrls = [
      '/api/admin/tickets',
      '/api/admin/tickets/stats',
      '/tickets'
    ];

    console.log('\n🧪 Probando APIs autenticadas...');

    for (const url of testUrls) {
      const options = {
        hostname: 'localhost',
        port: 3002,
        path: url,
        method: 'GET',
        headers: {
          'Cookie': `auth_token=${authCookie.value}`,
          'User-Agent': 'Test-Script'
        }
      };

      try {
        const result = await new Promise((resolve, reject) => {
          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              resolve({
                statusCode: res.statusCode,
                data: data,
                headers: res.headers
              });
            });
          });

          req.on('error', reject);
          req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
          });

          req.end();
        });

        console.log(`✅ ${url}: ${result.statusCode}`);
        
        if (result.statusCode === 200) {
          console.log(`   📄 Respuesta recibida (${result.data.length} bytes)`);
          
          if (url === '/api/admin/tickets/stats') {
            try {
              const stats = JSON.parse(result.data);
              if (stats.data) {
                console.log(`   📊 Estadísticas: ${stats.data.generales?.total || 0} tickets total`);
              }
            } catch (e) {
              console.log('   ⚠️ No se pudo parsear la respuesta JSON');
            }
          }
        } else if (result.statusCode === 401) {
          console.log(`   🔒 No autenticado`);
        } else if (result.statusCode === 403) {
          console.log(`   🚫 Acceso denegado`);
        } else {
          console.log(`   ⚠️ Status inesperado: ${result.statusCode}`);
        }

      } catch (error) {
        console.error(`❌ Error en ${url}:`, error.message);
      }
    }

    console.log('\n🎉 Pruebas completadas!');

  } catch (error) {
    console.error('❌ Error en login:', error.message);
  }
}

// Ejecutar la prueba
testTicketsAuthenticated();
