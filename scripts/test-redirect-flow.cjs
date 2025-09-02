const axios = require('axios');

async function testRedirectFlow() {
  try {
    console.log('🧪 Probando flujo completo de login y redirección...\n');
    
    // 1. Login
    console.log('1️⃣ Intentando login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: { 'Content-Type': 'application/json' },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Aceptar redirects
      }
    });
    
    console.log('✅ Login exitoso:', loginResponse.status);
    console.log('📄 Respuesta:', loginResponse.data.message);
    
    // 2. Obtener cookies de la respuesta
    const cookies = loginResponse.headers['set-cookie'];
    if (cookies) {
      console.log('🍪 Cookies recibidas:', cookies.length);
    }
    
    // 3. Intentar acceder al dashboard
    console.log('\n2️⃣ Intentando acceder al dashboard...');
    try {
      const dashboardResponse = await axios.get('http://localhost:3001/dashboard', {
        headers: {
          'Cookie': cookies ? cookies.join('; ') : '',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      
      console.log('✅ Dashboard accesible:', dashboardResponse.status);
      console.log('📄 Contenido (primeros 200 chars):', dashboardResponse.data.substring(0, 200));
      
    } catch (dashboardError) {
      if (dashboardError.response) {
        console.log('❌ Error en dashboard:', dashboardError.response.status);
        console.log('📄 Mensaje:', dashboardError.response.data);
      } else {
        console.log('❌ Error de red:', dashboardError.message);
      }
    }
    
    // 4. Verificar estado de autenticación
    console.log('\n3️⃣ Verificando estado de autenticación...');
    try {
      const verifyResponse = await axios.post('http://localhost:3001/api/auth/verify', {}, {
        headers: {
          'Cookie': cookies ? cookies.join('; ') : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Verificación exitosa:', verifyResponse.status);
      console.log('📄 Estado:', verifyResponse.data);
      
    } catch (verifyError) {
      if (verifyError.response) {
        console.log('❌ Error en verificación:', verifyError.response.status);
      } else {
        console.log('❌ Error de red:', verifyError.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📄 Data:', error.response.data);
    }
  }
}

testRedirectFlow();
