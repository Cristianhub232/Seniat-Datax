const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testCarteraTableRendering() {
  try {
    console.log('🧪 Probando renderizado de tabla de Cartera Contribuyentes...\n');
    
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
    
    // 3. Probar API de contribuyentes (sin filtros)
    console.log('\n2. Probando API de contribuyentes (sin filtros)...');
    const contribuyentesResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Contribuyentes obtenidos:');
    console.log('   - Status:', contribuyentesResponse.status);
    console.log('   - Cantidad:', contribuyentesResponse.data.length);
    
    if (contribuyentesResponse.data.length > 0) {
      console.log('   - Primer registro:');
      console.log('     * ID:', contribuyentesResponse.data[0].id);
      console.log('     * RIF:', contribuyentesResponse.data[0].rif);
      console.log('     * Tipo:', contribuyentesResponse.data[0].tipoContribuyente);
      console.log('     * Usuario:', contribuyentesResponse.data[0].firstName, contribuyentesResponse.data[0].lastName);
      console.log('     * Creado:', contribuyentesResponse.data[0].createdAt);
    }
    
    // 4. Probar API de estadísticas
    console.log('\n3. Probando API de estadísticas...');
    const statsResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes/stats`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Estadísticas obtenidas:');
    console.log('   - Total:', statsResponse.data.total);
    console.log('   - Naturales:', statsResponse.data.naturales);
    console.log('   - Jurídicos:', statsResponse.data.juridicos);
    console.log('   - Gobierno:', statsResponse.data.gobierno);
    console.log('   - Consejos Comunales:', statsResponse.data.consejosComunales);
    
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
    
    // 7. Verificar estructura de datos
    console.log('\n6. Verificando estructura de datos...');
    if (contribuyentesResponse.data.length > 0) {
      const sample = contribuyentesResponse.data[0];
      const requiredFields = ['id', 'rif', 'tipoContribuyente', 'createdAt'];
      const optionalFields = ['firstName', 'lastName', 'username'];
      
      console.log('   - Campos requeridos:');
      requiredFields.forEach(field => {
        const hasField = sample.hasOwnProperty(field);
        console.log(`     * ${field}: ${hasField ? '✅' : '❌'}`);
      });
      
      console.log('   - Campos opcionales:');
      optionalFields.forEach(field => {
        const hasField = sample.hasOwnProperty(field);
        console.log(`     * ${field}: ${hasField ? '✅' : '❌'}`);
      });
    }
    
    // 8. Probar página completa
    console.log('\n7. Probando página completa...');
    const pageResponse = await axios.get(`${BASE_URL}/cartera-contribuyentes`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Página cargada:');
    console.log('   - Status:', pageResponse.status);
    console.log('   - Tamaño:', pageResponse.data.length, 'caracteres');
    
    // Verificar si la página contiene elementos clave
    const pageContent = pageResponse.data;
    const hasTable = pageContent.includes('table') || pageContent.includes('Table');
    const hasStats = pageContent.includes('stats') || pageContent.includes('estadísticas');
    const hasFilters = pageContent.includes('filtro') || pageContent.includes('filter');
    
    console.log('   - Contiene tabla:', hasTable ? '✅' : '❌');
    console.log('   - Contiene estadísticas:', hasStats ? '✅' : '❌');
    console.log('   - Contiene filtros:', hasFilters ? '✅' : '❌');
    
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
testCarteraTableRendering(); 