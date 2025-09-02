const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testCarteraFrontendDebug() {
  try {
    console.log('🧪 Probando frontend con logs de depuración...\n');
    
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
    
    // 3. Probar página de cartera contribuyentes
    console.log('\n2. Probando página de cartera contribuyentes...');
    const pageResponse = await axios.get(`${BASE_URL}/cartera-contribuyentes`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Página cargada:');
    console.log('   - Status:', pageResponse.status);
    console.log('   - Tamaño:', pageResponse.data.length, 'caracteres');
    
    // 4. Verificar si hay información de debug en el HTML
    const pageContent = pageResponse.data;
    const hasDebugInfo = pageContent.includes('Debug:') || pageContent.includes('isLoading=');
    
    console.log('\n3. Verificando información de debug:');
    console.log('   - Información de debug presente:', hasDebugInfo ? '✅' : '❌');
    
    if (hasDebugInfo) {
      // Extraer información de debug si está presente
      const debugMatch = pageContent.match(/Debug:.*?isLoading=([^,]+),.*?contribuyentes\.length=(\d+)/);
      if (debugMatch) {
        console.log('   - isLoading:', debugMatch[1]);
        console.log('   - contribuyentes.length:', debugMatch[2]);
      }
    }
    
    // 5. Verificar si hay logs de console en el HTML
    const hasConsoleLogs = pageContent.includes('console.log') || pageContent.includes('🔍') || pageContent.includes('📊');
    
    console.log('\n4. Verificando logs de console:');
    console.log('   - Logs de console presentes:', hasConsoleLogs ? '✅' : '❌');
    
    // 6. Verificar elementos de la tabla
    const hasTable = pageContent.includes('<table') || pageContent.includes('Table');
    const hasTableBody = pageContent.includes('TableBody') || pageContent.includes('tbody');
    const hasTableRow = pageContent.includes('TableRow') || pageContent.includes('tr');
    
    console.log('\n5. Verificando elementos de tabla:');
    console.log('   - Tabla presente:', hasTable ? '✅' : '❌');
    console.log('   - TableBody presente:', hasTableBody ? '✅' : '❌');
    console.log('   - TableRow presente:', hasTableRow ? '✅' : '❌');
    
    // 7. Verificar datos renderizados
    const hasRifData = pageContent.includes('J000202002') || pageContent.includes('rif');
    const hasTipoData = pageContent.includes('JURIDICO') || pageContent.includes('NATURAL');
    const hasUserData = pageContent.includes('Administrador') || pageContent.includes('Sistema');
    
    console.log('\n6. Verificando datos renderizados:');
    console.log('   - Datos RIF presentes:', hasRifData ? '✅' : '❌');
    console.log('   - Datos tipo presentes:', hasTipoData ? '✅' : '❌');
    console.log('   - Datos usuario presentes:', hasUserData ? '✅' : '❌');
    
    // 8. Probar API directamente para comparar
    console.log('\n7. Comparando con API directa...');
    const apiResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('   - Datos de API:', apiResponse.data.length, 'registros');
    
    // 9. Verificar si los datos de la API están en el HTML
    if (apiResponse.data.length > 0) {
      const firstRecord = apiResponse.data[0];
      const rifInHtml = pageContent.includes(firstRecord.rif);
      const tipoInHtml = pageContent.includes(firstRecord.tipoContribuyente);
      
      console.log('\n8. Verificando si los datos de la API están en el HTML:');
      console.log('   - RIF en HTML:', rifInHtml ? '✅' : '❌');
      console.log('   - Tipo en HTML:', tipoInHtml ? '✅' : '❌');
    }
    
    console.log('\n✅ Análisis de debug completado');
    
    // 10. Resumen de problemas
    console.log('\n📋 Resumen de problemas encontrados:');
    const issues = [];
    
    if (!hasDebugInfo) {
      issues.push('❌ No se encontró información de debug en el HTML');
    }
    
    if (!hasTable) {
      issues.push('❌ No se encontró tabla en el HTML');
    }
    
    if (!hasRifData) {
      issues.push('❌ No se encontraron datos RIF en el HTML');
    }
    
    if (issues.length === 0) {
      console.log('✅ No se encontraron problemas evidentes');
    } else {
      issues.forEach(issue => console.log(issue));
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
testCarteraFrontendDebug(); 