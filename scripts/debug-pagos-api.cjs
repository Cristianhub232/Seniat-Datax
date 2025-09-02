const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function debugPagosAPI() {
  try {
    console.log('🔍 Debuggeando API de Pagos Ejecutados...\n');
    
    // 1. Login
    console.log('1. Realizando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login falló');
      return;
    }
    
    console.log('✅ Login exitoso');
    
    // 2. Obtener token
    const cookies = loginResponse.headers['set-cookie'];
    const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
    const authToken = authCookie.split(';')[0];
    
    // 3. Probar con fechas específicas
    console.log('\n2. Probando con fechas específicas...');
    const fechaInicio = '2025-08-01';
    const fechaFin = '2025-08-31';
    
    console.log('   - Fecha inicio:', fechaInicio);
    console.log('   - Fecha fin:', fechaFin);
    
    try {
      const pagosResponse = await axios.get(`${BASE_URL}/api/admin/pagos-ejecutados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Cookie': authToken }
      });
      
      console.log('✅ API funcionando:');
      console.log('   - Status:', pagosResponse.status);
      console.log('   - Registros:', pagosResponse.data.length);
      
    } catch (error) {
      console.log('❌ Error en API:');
      console.log('   - Status:', error.response?.status);
      console.log('   - Error:', error.response?.data?.error);
      console.log('   - Mensaje:', error.message);
      
      // Intentar con diferentes fechas
      console.log('\n3. Probando con fechas diferentes...');
      
      const fechaInicio2 = '2024-01-01';
      const fechaFin2 = '2024-12-31';
      
      try {
        const pagosResponse2 = await axios.get(`${BASE_URL}/api/admin/pagos-ejecutados?fechaInicio=${fechaInicio2}&fechaFin=${fechaFin2}`, {
          headers: { 'Cookie': authToken }
        });
        
        console.log('✅ API funcionando con fechas 2024:');
        console.log('   - Status:', pagosResponse2.status);
        console.log('   - Registros:', pagosResponse2.data.length);
        
      } catch (error2) {
        console.log('❌ Error persistente:');
        console.log('   - Status:', error2.response?.status);
        console.log('   - Error:', error2.response?.data?.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar el debug
debugPagosAPI(); 