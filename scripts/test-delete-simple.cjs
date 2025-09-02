const axios = require('axios');

async function testDeleteSimple() {
  console.log('🔍 Prueba simple de eliminación...\\n');
  
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
        
        // 3. Intentar eliminar
        console.log('\\n3. Intentando eliminar...');
        console.log(`URL: ${baseURL}/api/admin/cartera-contribuyentes/${contribuyente.id}`);
        
        try {
          const deleteResponse = await axios.delete(`${baseURL}/api/admin/cartera-contribuyentes/${contribuyente.id}`, {
            headers: { 'Cookie': `auth_token=${authToken}` }
          });
          
          console.log('✅ Eliminación exitosa:', deleteResponse.data);
        } catch (deleteError) {
          console.log('❌ Error en eliminación:');
          console.log('   Status:', deleteError.response?.status);
          console.log('   Data:', deleteError.response?.data);
          console.log('   Message:', deleteError.message);
        }
      } else {
        console.log('❌ No hay contribuyentes');
      }
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testDeleteSimple(); 