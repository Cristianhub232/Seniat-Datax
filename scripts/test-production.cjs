const axios = require('axios');

async function testProduction() {
  try {
    console.log('🧪 Probando aplicación en PRODUCCIÓN...\n');
    
    // 1. Probar página principal
    console.log('1️⃣ Probando página principal...');
    try {
      const homeResponse = await axios.get('http://localhost:3001');
      console.log('✅ Página principal:', homeResponse.status);
      console.log('📄 Título:', homeResponse.data.includes('SENIAT DataFiscal') ? '✅ Correcto' : '❌ Incorrecto');
    } catch (error) {
      console.log('❌ Error en página principal:', error.message);
    }
    
    // 2. Probar redirección a login
    console.log('\n2️⃣ Probando redirección a login...');
    try {
      const loginResponse = await axios.get('http://localhost:3001/login');
      console.log('✅ Página de login:', loginResponse.status);
      console.log('📄 Formulario de login:', loginResponse.data.includes('Usuario SENIAT') ? '✅ Presente' : '❌ Ausente');
    } catch (error) {
      console.log('❌ Error en página de login:', error.message);
    }
    
    // 3. Probar API de login
    console.log('\n3️⃣ Probando API de login...');
    try {
      const loginApiResponse = await axios.post('http://localhost:3001/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Login API:', loginApiResponse.status);
      console.log('📄 Respuesta:', loginApiResponse.data.message);
      
      // Verificar cookie de autenticación
      const cookies = loginApiResponse.headers['set-cookie'];
      if (cookies && cookies.some(cookie => cookie.includes('auth_token'))) {
        console.log('🍪 Cookie de autenticación:', '✅ Presente');
      } else {
        console.log('🍪 Cookie de autenticación:', '❌ Ausente');
      }
      
    } catch (error) {
      console.log('❌ Error en login API:', error.response?.status || error.message);
      if (error.response?.data) {
        console.log('📄 Detalles:', error.response.data);
      }
    }
    
    // 4. Probar acceso al dashboard (sin autenticación)
    console.log('\n4️⃣ Probando acceso al dashboard sin autenticación...');
    try {
      const dashboardResponse = await axios.get('http://localhost:3001/dashboard');
      console.log('⚠️ Dashboard accesible sin autenticación:', dashboardResponse.status);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Dashboard protegido correctamente:', error.response.status);
      } else {
        console.log('❌ Error inesperado en dashboard:', error.response?.status || error.message);
      }
    }
    
    // 5. Probar middleware de autenticación
    console.log('\n5️⃣ Probando middleware de autenticación...');
    try {
      const protectedResponse = await axios.get('http://localhost:3001/usuarios');
      console.log('⚠️ Página protegida accesible sin autenticación:', protectedResponse.status);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Página protegida correctamente:', error.response.status);
      } else {
        console.log('❌ Error inesperado en página protegida:', error.response?.status || error.message);
      }
    }
    
    // 6. Probar archivos estáticos
    console.log('\n6️⃣ Probando archivos estáticos...');
    try {
      const iconResponse = await axios.get('http://localhost:3001/icon');
      console.log('✅ Icono:', iconResponse.status);
    } catch (error) {
      console.log('❌ Error en icono:', error.response?.status || error.message);
    }
    
    // 7. Probar API de verificación
    console.log('\n7️⃣ Probando API de verificación...');
    try {
      const verifyResponse = await axios.post('http://localhost:3001/api/auth/verify', {}, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('⚠️ Verificación accesible sin token:', verifyResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Verificación protegida correctamente:', error.response.status);
      } else {
        console.log('❌ Error inesperado en verificación:', error.response?.status || error.message);
      }
    }
    
    console.log('\n🎯 Test de producción completado!');
    console.log('📍 URL de la aplicación: http://localhost:3001');
    console.log('🔐 Usuario de prueba: admin / admin123');
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

testProduction();
