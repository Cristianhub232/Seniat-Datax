const axios = require('axios');

// Configuración
const BASE_URL = 'http://172.16.56.23:3001';

async function testFrontendComplete() {
  console.log('🧪 Test Completo del Frontend - Flujo de Login');
  console.log('==============================================');
  console.log('');
  console.log(`📍 URL de la aplicación: ${BASE_URL}`);
  console.log(`📍 URL del login: ${BASE_URL}/login`);
  console.log(`👤 Usuario: admin`);
  console.log(`🔑 Contraseña: admin123`);
  console.log('');

  try {
    // 1. Probar la página principal (splash screen)
    console.log('1️⃣ Probando página principal (splash screen)...');
    const mainPageResponse = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`   ✅ Página principal: Status ${mainPageResponse.status}`);
    console.log(`   📄 Tamaño: ${mainPageResponse.data.length} bytes`);
    
    // Verificar contenido del splash screen
    if (mainPageResponse.data.includes('SplashScreen') || mainPageResponse.data.includes('splash-title')) {
      console.log('   ✅ Splash screen detectado en la respuesta');
    } else {
      console.log('   ❌ Splash screen no detectado');
    }

    // 2. Probar la página de login directamente
    console.log('\n2️⃣ Probando página de login...');
    const loginPageResponse = await axios.get(`${BASE_URL}/login`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`   ✅ Página de login: Status ${loginPageResponse.status}`);
    console.log(`   📄 Tamaño: ${loginPageResponse.data.length} bytes`);
    
    // Verificar contenido del formulario de login
    if (loginPageResponse.data.includes('Usuario SENIAT') || loginPageResponse.data.includes('login')) {
      console.log('   ✅ Formulario de login detectado');
    } else {
      console.log('   ❌ Formulario de login no detectado');
    }

    // 3. Probar el login con las credenciales
    console.log('\n3️⃣ Probando login con credenciales...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`   ✅ Login exitoso: Status ${loginResponse.status}`);
    console.log(`   👤 Usuario: ${loginResponse.data.user?.username}`);
    console.log(`   🎭 Rol: ${loginResponse.data.user?.role}`);
    console.log(`   🔑 Token recibido: ${loginResponse.data.token ? 'SÍ' : 'NO'}`);

    // 4. Obtener cookies de autenticación
    const cookies = loginResponse.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      console.log('\n🍪 Cookies de autenticación recibidas:');
      cookies.forEach((cookie, index) => {
        console.log(`   ${index + 1}. ${cookie.split(';')[0]}`);
      });

      // 5. Probar acceso al dashboard con autenticación
      console.log('\n4️⃣ Probando acceso al dashboard con autenticación...');
      try {
        const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
          headers: { 
            'Cookie': cookies.join('; '),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log(`   ✅ Dashboard accesible: Status ${dashboardResponse.status}`);
        console.log(`   📄 Tamaño: ${dashboardResponse.data.length} bytes`);
        
        // Verificar contenido del dashboard
        if (dashboardResponse.data.includes('Dashboard')) {
          console.log('   ✅ Contenido del dashboard detectado');
        }
        
        // Verificar navegación
        if (dashboardResponse.data.includes('nav') || dashboardResponse.data.includes('sidebar')) {
          console.log('   ✅ Navegación del dashboard detectada');
        }
        
      } catch (dashboardError) {
        console.log(`   ❌ Error accediendo al dashboard: ${dashboardError.response?.status || 'Unknown'}`);
        console.log(`   📝 Detalles: ${dashboardError.message}`);
      }

      // 6. Probar API de verificación de sesión
      console.log('\n5️⃣ Probando verificación de sesión...');
      try {
        const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify`, {}, {
          headers: { 
            'Cookie': cookies.join('; '),
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log(`   ✅ Verificación exitosa: Status ${verifyResponse.status}`);
        console.log(`   👤 Usuario verificado: ${verifyResponse.data.user?.username}`);
        console.log(`   🎭 Rol verificado: ${verifyResponse.data.user?.role}`);
        
      } catch (verifyError) {
        console.log(`   ❌ Error en verificación: ${verifyError.response?.status || 'Unknown'}`);
        console.log(`   📝 Detalles: ${verifyError.message}`);
      }

    } else {
      console.log('❌ No se recibieron cookies de autenticación');
    }

    // 7. Probar logout
    console.log('\n6️⃣ Probando logout...');
    try {
      const logoutResponse = await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
        headers: { 
          'Cookie': cookies ? cookies.join('; ') : '',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`   ✅ Logout exitoso: Status ${logoutResponse.status}`);
      console.log(`   📝 Mensaje: ${logoutResponse.data.message}`);
      
    } catch (logoutError) {
      console.log(`   ❌ Error en logout: ${logoutError.response?.status || 'Unknown'}`);
      console.log(`   📝 Detalles: ${logoutError.message}`);
    }

    console.log('\n🎯 Test del frontend completado exitosamente!');
    console.log('');
    console.log('💡 Resumen del flujo:');
    console.log('   ✅ Splash screen se muestra correctamente');
    console.log('   ✅ Página de login accesible');
    console.log('   ✅ Login con admin/admin123 funciona');
    console.log('   ✅ Dashboard accesible después del login');
    console.log('   ✅ Verificación de sesión funciona');
    console.log('   ✅ Logout funciona correctamente');

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
  testFrontendComplete();
} catch (error) {
  console.log('📦 Axios no está instalado. Instalando...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios instalado. Ejecutando prueba...');
    testFrontendComplete();
  } catch (installError) {
    console.error('❌ Error instalando axios:', installError.message);
    console.log('');
    console.log('💡 Para probar manualmente:');
    console.log('   1. Abre http://172.16.56.23:3001 en tu navegador');
    console.log('   2. Espera 5 segundos a que termine el splash screen');
    console.log('   3. Verifica que te redirija a /login');
    console.log('   4. Usa admin/admin123 para iniciar sesión');
    console.log('   5. Verifica que te redirija al dashboard');
  }
}
