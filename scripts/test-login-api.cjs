const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testLoginAPI() {
  try {
    console.log('🧪 Probando API de Login');
    console.log('========================');
    console.log(`📍 URL: ${BASE_URL}`);
    console.log(`👤 Usuario: admin`);
    console.log(`🔑 Contraseña: admin123`);
    console.log('');

    // 1. Probar login
    console.log('1️⃣ Realizando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login exitoso!');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response:`, loginResponse.data);

    // 2. Obtener cookies de autenticación
    const cookies = loginResponse.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      console.log('\n🍪 Cookies recibidas:');
      cookies.forEach((cookie, index) => {
        console.log(`   ${index + 1}. ${cookie}`);
      });

      // 3. Probar acceso a página protegida
      console.log('\n2️⃣ Probando acceso a página protegida...');
      try {
        const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
          headers: { 
            'Cookie': cookies.join('; '),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('✅ Dashboard accesible!');
        console.log(`   Status: ${dashboardResponse.status}`);
        console.log(`   Tamaño: ${dashboardResponse.data.length} bytes`);
        
        // Verificar contenido del dashboard
        if (dashboardResponse.data.includes('Dashboard')) {
          console.log('   ✅ Contenido del dashboard detectado');
        }
        
      } catch (dashboardError) {
        console.log('❌ Error accediendo al dashboard:', dashboardError.response?.status || 'Unknown');
        console.log('   Detalles:', dashboardError.message);
      }

      // 4. Probar API de verificación
      console.log('\n3️⃣ Probando API de verificación...');
      try {
        const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify`, {}, {
          headers: { 
            'Cookie': cookies.join('; '),
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Verificación exitosa!');
        console.log(`   Status: ${verifyResponse.status}`);
        console.log(`   Response:`, verifyResponse.data);
        
      } catch (verifyError) {
        console.log('❌ Error en verificación:', verifyError.response?.status || 'Unknown');
        console.log('   Detalles:', verifyError.message);
      }

    } else {
      console.log('❌ No se recibieron cookies de autenticación');
    }

    console.log('\n🎯 Prueba de login completada!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Headers:', error.response.headers);
    }
  }
}

// Verificar si axios está instalado
try {
  require('axios');
  testLoginAPI();
} catch (error) {
  console.log('📦 Axios no está instalado. Instalando...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios instalado. Ejecutando prueba...');
    testLoginAPI();
  } catch (installError) {
    console.error('❌ Error instalando axios:', installError.message);
    console.log('💡 Para probar manualmente:');
    console.log('   1. Ve a http://localhost:3001/login');
    console.log('   2. Usa admin/admin123');
    console.log('   3. Verifica que te redirija al dashboard');
  }
}
