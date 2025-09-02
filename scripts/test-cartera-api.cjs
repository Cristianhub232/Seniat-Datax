const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testCarteraAPI() {
  try {
    console.log('🧪 Probando API de Cartera Contribuyentes...\n');
    
    // 1. Intentar login para obtener token
    console.log('1. Intentando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login falló:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login exitoso');
    
    // 2. Obtener cookies del login
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      console.log('❌ No se obtuvieron cookies del login');
      return;
    }
    
    // Extraer auth_token de las cookies
    const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
    if (!authCookie) {
      console.log('❌ No se encontró auth_token en las cookies');
      return;
    }
    
    const authToken = authCookie.split(';')[0];
    console.log('✅ Token obtenido:', authToken.substring(0, 50) + '...');
    
    // 3. Probar API de estadísticas
    console.log('\n2. Probando API de estadísticas...');
    const statsResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes/stats`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Estadísticas obtenidas:', statsResponse.data);
    
    // 4. Probar API de contribuyentes
    console.log('\n3. Probando API de contribuyentes...');
    const contribuyentesResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Contribuyentes obtenidos:');
    console.log('   - Cantidad:', contribuyentesResponse.data.length);
    
    if (contribuyentesResponse.data.length > 0) {
      console.log('   - Primer registro:', contribuyentesResponse.data[0]);
    }
    
    // 5. Probar filtros
    console.log('\n4. Probando filtros...');
    const filtroResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?tipo=JURIDICO`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Filtro por tipo JURIDICO:');
    console.log('   - Cantidad:', filtroResponse.data.length);
    
    // 6. Probar búsqueda por RIF
    console.log('\n5. Probando búsqueda por RIF...');
    const rifResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?rif=J000202002`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Búsqueda por RIF J000202002:');
    console.log('   - Cantidad:', rifResponse.data.length);
    if (rifResponse.data.length > 0) {
      console.log('   - Resultado:', rifResponse.data[0]);
    }
    
    console.log('\n✅ Todas las pruebas completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testCarteraAPI(); 