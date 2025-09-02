const http = require('http');

function testFrontendSimple() {
  console.log('🧪 Test de Login Frontend Simple');
  console.log('================================');
  console.log('');
  console.log('📍 URL de la aplicación: http://localhost:3001');
  console.log('👤 Usuario: admin');
  console.log('🔑 Contraseña: admin123');
  console.log('');

  // 1. Probar la página principal (splash screen)
  console.log('1️⃣ Probando página principal (splash screen)...');
  testPage('http://localhost:3001', 'Página Principal');

  // 2. Probar la página de login
  console.log('\n2️⃣ Probando página de login...');
  testPage('http://localhost:3001/login', 'Página de Login');

  // 3. Probar el dashboard (debería redirigir al login si no hay sesión)
  console.log('\n3️⃣ Probando acceso al dashboard sin sesión...');
  testPage('http://localhost:3001/dashboard', 'Dashboard (sin sesión)');

  console.log('\n🎯 Test completado!');
  console.log('');
  console.log('💡 Para probar el login completo manualmente:');
  console.log('   1. Abre http://localhost:3001 en tu navegador');
  console.log('   2. Espera 5 segundos a que termine el splash screen');
  console.log('   3. Verifica que te redirija a /login');
  console.log('   4. Usa admin/admin123 para iniciar sesión');
  console.log('   5. Verifica que te redirija al dashboard');
}

function testPage(url, name) {
  const urlObj = new URL(url);
  
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`   📡 ${name}: Status ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`   📄 ${name}: ${data.length} bytes`);
      
      // Verificar contenido específico según la página
      if (name === 'Página Principal') {
        if (data.includes('SplashScreen') || data.includes('splash-title')) {
          console.log(`   ✅ ${name}: Splash screen detectado`);
        } else {
          console.log(`   ❌ ${name}: Splash screen no detectado`);
        }
      }
      
      if (name === 'Página de Login') {
        if (data.includes('login') || data.includes('Usuario SENIAT')) {
          console.log(`   ✅ ${name}: Formulario de login detectado`);
        } else {
          console.log(`   ❌ ${name}: Formulario de login no detectado`);
        }
      }
      
      if (name === 'Dashboard (sin sesión)') {
        if (res.statusCode === 302 || res.statusCode === 401 || data.includes('login')) {
          console.log(`   ✅ ${name}: Redirección al login (protección activa)`);
        } else if (res.statusCode === 200) {
          console.log(`   ⚠️ ${name}: Dashboard accesible sin autenticación`);
        } else {
          console.log(`   ❓ ${name}: Comportamiento inesperado (${res.statusCode})`);
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error(`   ❌ ${name}: Error - ${error.message}`);
  });

  req.end();
}

// Ejecutar el test
testFrontendSimple();
