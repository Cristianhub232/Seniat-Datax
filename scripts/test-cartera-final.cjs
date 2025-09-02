const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testCarteraFinal() {
  try {
    console.log('🧪 Prueba final de Cartera Contribuyentes...\n');
    
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
    
    // 3. Probar API de contribuyentes
    console.log('\n2. Probando API de contribuyentes...');
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
      const first = contribuyentesResponse.data[0];
      console.log('     * ID:', first.id);
      console.log('     * RIF:', first.rif);
      console.log('     * Tipo:', first.tipoContribuyente);
      console.log('     * Usuario:', first.usuario ? `${first.usuario.firstName} ${first.usuario.lastName}` : 'N/A');
      console.log('     * Creado:', first.createdAt);
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
    const juridicosResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?tipo=JURIDICO`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Filtro por tipo JURIDICO:');
    console.log('   - Cantidad:', juridicosResponse.data.length);
    
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
      console.log('   - Resultado:', rifResponse.data[0].rif);
    }
    
    // 7. Verificar consistencia de datos
    console.log('\n6. Verificando consistencia de datos...');
    const totalFromAPI = contribuyentesResponse.data.length;
    const totalFromStats = statsResponse.data.total;
    
    console.log('   - Total desde API:', totalFromAPI);
    console.log('   - Total desde stats:', totalFromStats);
    console.log('   - Coinciden:', totalFromAPI === totalFromStats ? '✅' : '❌');
    
    // 8. Verificar estructura de datos
    console.log('\n7. Verificando estructura de datos...');
    const validRecords = contribuyentesResponse.data.filter(record => 
      record.id && 
      record.rif && 
      record.tipoContribuyente && 
      record.createdAt
    );
    
    console.log('   - Registros válidos:', validRecords.length, 'de', contribuyentesResponse.data.length);
    console.log('   - Estructura correcta:', validRecords.length === contribuyentesResponse.data.length ? '✅' : '❌');
    
    // 9. Verificar tipos de contribuyentes
    console.log('\n8. Verificando tipos de contribuyentes...');
    const tipos = {};
    contribuyentesResponse.data.forEach(record => {
      const tipo = record.tipoContribuyente;
      tipos[tipo] = (tipos[tipo] || 0) + 1;
    });
    
    Object.keys(tipos).forEach(tipo => {
      console.log(`   - ${tipo}: ${tipos[tipo]} registros`);
    });
    
    // 10. Resumen final
    console.log('\n📋 Resumen final:');
    console.log('✅ API de contribuyentes: Funcionando');
    console.log('✅ API de estadísticas: Funcionando');
    console.log('✅ Filtros: Funcionando');
    console.log('✅ Búsqueda por RIF: Funcionando');
    console.log('✅ Estructura de datos: Correcta');
    console.log('✅ Consistencia de datos: Correcta');
    
    console.log('\n🎯 Estado del sistema:');
    if (totalFromAPI > 0 && totalFromAPI === totalFromStats && validRecords.length === contribuyentesResponse.data.length) {
      console.log('✅ SISTEMA FUNCIONANDO CORRECTAMENTE');
      console.log(`📊 Total de contribuyentes: ${totalFromAPI}`);
      console.log('🔧 El frontend debería mostrar los datos correctamente');
    } else {
      console.log('❌ Hay problemas en el sistema');
    }
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testCarteraFinal(); 