const axios = require('axios');

async function testLogout() {
  try {
    console.log('🧪 Probando logout...\n');
    
    // 1. Primero hacer login para obtener cookies
    console.log('1️⃣ Haciendo login para obtener cookies...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Login exitoso:', loginResponse.status);
    
    // 2. Obtener cookies de la respuesta
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      console.log('❌ No se recibieron cookies');
      return;
    }
    
    console.log('🍪 Cookies recibidas:', cookies.length);
    
    // 3. Intentar logout
    console.log('\n2️⃣ Intentando logout...');
    const logoutResponse = await axios.post('http://localhost:3001/api/auth/logout', {}, {
      headers: {
        'Cookie': cookies.join('; '),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Logout exitoso:', logoutResponse.status);
    console.log('📄 Respuesta:', logoutResponse.data);
    
    // 4. Verificar que ya no se puede acceder al dashboard
    console.log('\n3️⃣ Verificando que el dashboard ya no es accesible...');
    try {
      const dashboardResponse = await axios.get('http://localhost:3001/dashboard', {
        headers: {
          'Cookie': cookies.join('; '),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      console.log('⚠️ Dashboard aún accesible después del logout:', dashboardResponse.status);
      
    } catch (dashboardError) {
      if (dashboardError.response) {
        console.log('✅ Dashboard no accesible después del logout:', dashboardError.response.status);
      } else {
        console.log('❌ Error de red:', dashboardError.message);
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

testLogout();
