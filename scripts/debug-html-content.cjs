const axios = require('axios');
const fs = require('fs');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function debugHtmlContent() {
  try {
    console.log('🧪 Analizando contenido HTML completo...\n');
    
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
    console.log('\n2. Obteniendo HTML completo...');
    const pageResponse = await axios.get(`${BASE_URL}/cartera-contribuyentes`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('✅ Página cargada:');
    console.log('   - Status:', pageResponse.status);
    console.log('   - Tamaño:', pageResponse.data.length, 'caracteres');
    
    // 4. Guardar HTML en archivo para análisis
    const htmlContent = pageResponse.data;
    fs.writeFileSync('debug-page.html', htmlContent);
    console.log('   - HTML guardado en debug-page.html');
    
    // 5. Buscar elementos específicos
    console.log('\n3. Buscando elementos específicos...');
    
    // Buscar elementos de debug
    const debugElements = [
      'MODO DEBUG',
      'TABLA DE CONTRIBUYENTES',
      'Estado del componente',
      'isLoading',
      'contribuyentes.length',
      'Datos de prueba estáticos',
      'J000202002',
      'JURIDICO',
      'Administrador Sistema'
    ];
    
    debugElements.forEach(element => {
      const found = htmlContent.includes(element);
      console.log(`   - "${element}": ${found ? '✅' : '❌'}`);
    });
    
    // 6. Buscar secciones del componente
    console.log('\n4. Buscando secciones del componente...');
    
    const sections = [
      'Cartera de Contribuyentes',
      'Dashboard de Estadísticas',
      'Contribuyentes Registrados',
      'Filtros de Búsqueda',
      'Agregar RIF',
      'Cargar CSV'
    ];
    
    sections.forEach(section => {
      const found = htmlContent.includes(section);
      console.log(`   - "${section}": ${found ? '✅' : '❌'}`);
    });
    
    // 7. Buscar elementos de React/Next.js
    console.log('\n5. Buscando elementos de React/Next.js...');
    
    const reactElements = [
      'data-reactroot',
      '__NEXT_DATA__',
      'use client',
      'useState',
      'useEffect'
    ];
    
    reactElements.forEach(element => {
      const found = htmlContent.includes(element);
      console.log(`   - "${element}": ${found ? '✅' : '❌'}`);
    });
    
    // 8. Extraer fragmentos relevantes
    console.log('\n6. Extrayendo fragmentos relevantes...');
    
    // Buscar el contenido principal
    const mainContentMatch = htmlContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainContentMatch) {
      console.log('   - Contenido principal encontrado');
      fs.writeFileSync('debug-main-content.html', mainContentMatch[1]);
      console.log('   - Contenido principal guardado en debug-main-content.html');
    } else {
      console.log('   - ❌ No se encontró contenido principal');
    }
    
    // Buscar el contenido del body
    const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyContentMatch) {
      console.log('   - Contenido del body encontrado');
      fs.writeFileSync('debug-body-content.html', bodyContentMatch[1]);
      console.log('   - Contenido del body guardado en debug-body-content.html');
    } else {
      console.log('   - ❌ No se encontró contenido del body');
    }
    
    // 9. Verificar si es una página de error
    console.log('\n7. Verificando si es una página de error...');
    
    const errorIndicators = [
      'Error',
      '404',
      '500',
      'Internal Server Error',
      'Page Not Found'
    ];
    
    const hasError = errorIndicators.some(indicator => htmlContent.includes(indicator));
    console.log(`   - Contiene indicadores de error: ${hasError ? '❌' : '✅'}`);
    
    console.log('\n✅ Análisis HTML completado');
    console.log('\n📋 Archivos generados:');
    console.log('   - debug-page.html (HTML completo)');
    console.log('   - debug-main-content.html (Contenido principal)');
    console.log('   - debug-body-content.html (Contenido del body)');
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar el análisis
debugHtmlContent(); 