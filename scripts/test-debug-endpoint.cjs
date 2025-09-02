const axios = require('axios');

async function testDebugEndpoint() {
  console.log('🔍 Probando endpoint de debug...\\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. Login
    console.log('1. Login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data.message === 'Login exitoso') {
      const cookies = loginResponse.headers['set-cookie'];
      const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
      const authToken = authCookie.split('=')[1].split(';')[0];
      
      console.log('✅ Login exitoso');
      
      // 2. Obtener contribuyentes
      console.log('\\n2. Obteniendo contribuyentes...');
      const contribuyentesResponse = await axios.get(`${baseURL}/api/admin/cartera-contribuyentes`, {
        headers: { 'Cookie': `auth_token=${authToken}` }
      });
      
      if (contribuyentesResponse.data.length > 0) {
        const contribuyente = contribuyentesResponse.data[0];
        console.log(`✅ Contribuyente encontrado: ${contribuyente.rif} (ID: ${contribuyente.id})`);
        
        // 3. Probar endpoint de debug
        console.log('\\n3. Probando endpoint de debug...');
        const debugResponse = await axios.get(`${baseURL}/api/admin/cartera-contribuyentes/debug?id=${contribuyente.id}`, {
          headers: { 'Cookie': `auth_token=${authToken}` }
        });
        
        console.log('📋 Resultado del debug:');
        console.log(JSON.stringify(debugResponse.data, null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testDebugEndpoint(); 