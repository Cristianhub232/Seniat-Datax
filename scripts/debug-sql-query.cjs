const axios = require('axios');

async function debugSqlQuery() {
  console.log('🔍 Debug de consulta SQL...\\n');
  
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
        console.log(`   Tipo de ID: ${typeof contribuyente.id}`);
        console.log(`   Longitud del ID: ${contribuyente.id.length}`);
        console.log(`   ID en hex: ${Buffer.from(contribuyente.id).toString('hex')}`);
        
        // 3. Probar diferentes formatos de consulta
        console.log('\\n3. Probando diferentes formatos de consulta...');
        
        // Probar con comillas simples
        console.log('   Probando con comillas simples...');
        try {
          const testResponse1 = await axios.get(`${baseURL}/api/admin/cartera-contribuyentes?debug=true&id=${contribuyente.id}`, {
            headers: { 'Cookie': `auth_token=${authToken}` }
          });
          console.log('   Resultado:', testResponse1.data);
        } catch (error) {
          console.log('   Error:', error.response?.data);
        }
        
        // Probar con comillas dobles
        console.log('   Probando con comillas dobles...');
        try {
          const testResponse2 = await axios.get(`${baseURL}/api/admin/cartera-contribuyentes?debug=true&id="${contribuyente.id}"`, {
            headers: { 'Cookie': `auth_token=${authToken}` }
          });
          console.log('   Resultado:', testResponse2.data);
        } catch (error) {
          console.log('   Error:', error.response?.data);
        }
        
        // 4. Verificar si el ID existe en la base de datos
        console.log('\\n4. Verificando existencia del ID...');
        try {
          const checkResponse = await axios.get(`${baseURL}/api/admin/cartera-contribuyentes?check=${contribuyente.id}`, {
            headers: { 'Cookie': `auth_token=${authToken}` }
          });
          console.log('   Resultado de verificación:', checkResponse.data);
        } catch (error) {
          console.log('   Error en verificación:', error.response?.data);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugSqlQuery(); 