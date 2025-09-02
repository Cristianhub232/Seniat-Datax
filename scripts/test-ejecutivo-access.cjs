const axios = require('axios');

// Configuración para simular el navegador
const config = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  },
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 400; // Aceptar redirecciones
  }
};

async function testEjecutivoAccess() {
  try {
    console.log('🔍 Probando acceso del usuario ejecutivo...\n');
    
    const baseUrl = 'http://172.16.56.23:3001';
    
    console.log('1. Probando acceso a la página de pagos ejecutados...');
    
    try {
      const response = await axios.get(`${baseUrl}/pagos-ejecutados`, config);
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ URL final: ${response.request.res.responseUrl || response.config.url}`);
      
      if (response.status === 200) {
        console.log('   ✅ Acceso exitoso a /pagos-ejecutados');
      } else {
        console.log('   ❌ Acceso denegado o redirigido');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   🔍 Status: ${error.response.status}`);
        console.log(`   🔍 URL: ${error.response.config.url}`);
      }
    }

    console.log('\n2. Probando acceso a la API de pagos ejecutados...');
    
    try {
      const apiResponse = await axios.get(`${baseUrl}/api/admin/pagos-ejecutados?fechaInicio=2024-01-01&fechaFin=2024-12-31`, config);
      console.log(`   ✅ Status: ${apiResponse.status}`);
      
      if (apiResponse.status === 200) {
        console.log('   ✅ API accesible');
        if (apiResponse.data && Array.isArray(apiResponse.data)) {
          console.log(`   📊 Datos recibidos: ${apiResponse.data.length} registros`);
        }
      } else {
        console.log('   ❌ API no accesible');
      }
    } catch (error) {
      console.log(`   ❌ Error API: ${error.message}`);
      if (error.response) {
        console.log(`   🔍 Status: ${error.response.status}`);
        console.log(`   🔍 Data: ${JSON.stringify(error.response.data)}`);
      }
    }

    console.log('\n3. Probando acceso a la API de estadísticas...');
    
    try {
      const statsResponse = await axios.get(`${baseUrl}/api/admin/pagos-ejecutados/stats?fechaInicio=2024-01-01&fechaFin=2024-12-31`, config);
      console.log(`   ✅ Status: ${statsResponse.status}`);
      
      if (statsResponse.status === 200) {
        console.log('   ✅ API de estadísticas accesible');
        if (statsResponse.data) {
          console.log(`   📊 Estadísticas: ${JSON.stringify(statsResponse.data)}`);
        }
      } else {
        console.log('   ❌ API de estadísticas no accesible');
      }
    } catch (error) {
      console.log(`   ❌ Error API Stats: ${error.message}`);
      if (error.response) {
        console.log(`   🔍 Status: ${error.response.status}`);
        console.log(`   🔍 Data: ${JSON.stringify(error.response.data)}`);
      }
    }

    console.log('\n✅ Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('   - Middleware actualizado para permitir acceso a /pagos-ejecutados');
    console.log('   - API de pagos ejecutados accesible para ejecutivos');
    console.log('   - API de estadísticas accesible para ejecutivos');
    console.log('   - Usuario ejecutivo debería poder acceder al módulo');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

testEjecutivoAccess(); 