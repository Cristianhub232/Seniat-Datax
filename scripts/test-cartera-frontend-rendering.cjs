const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testCarteraFrontendRendering() {
  try {
    console.log('🧪 Probando renderizado del frontend de Cartera Contribuyentes...\n');
    
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
    
    // 4. Verificar elementos clave en el HTML
    const pageContent = pageResponse.data;
    
    // Verificar elementos de la tabla
    const hasTableHeader = pageContent.includes('TableHeader') || pageContent.includes('table-header');
    const hasTableBody = pageContent.includes('TableBody') || pageContent.includes('table-body');
    const hasTableRow = pageContent.includes('TableRow') || pageContent.includes('table-row');
    const hasTableCell = pageContent.includes('TableCell') || pageContent.includes('table-cell');
    
    console.log('\n3. Verificando elementos de la tabla:');
    console.log('   - TableHeader:', hasTableHeader ? '✅' : '❌');
    console.log('   - TableBody:', hasTableBody ? '✅' : '❌');
    console.log('   - TableRow:', hasTableRow ? '✅' : '❌');
    console.log('   - TableCell:', hasTableCell ? '✅' : '❌');
    
    // Verificar elementos de estadísticas
    const hasStatsCards = pageContent.includes('Total Contribuyentes') || pageContent.includes('total');
    const hasNaturales = pageContent.includes('Naturales') || pageContent.includes('naturales');
    const hasJuridicos = pageContent.includes('Jurídicos') || pageContent.includes('juridicos');
    
    console.log('\n4. Verificando elementos de estadísticas:');
    console.log('   - Cards de estadísticas:', hasStatsCards ? '✅' : '❌');
    console.log('   - Naturales:', hasNaturales ? '✅' : '❌');
    console.log('   - Jurídicos:', hasJuridicos ? '✅' : '❌');
    
    // Verificar elementos de filtros
    const hasFilters = pageContent.includes('Filtros de Búsqueda') || pageContent.includes('filtro');
    const hasRifFilter = pageContent.includes('Buscar por RIF') || pageContent.includes('rif');
    const hasTipoFilter = pageContent.includes('Filtrar por Tipo') || pageContent.includes('tipo');
    
    console.log('\n5. Verificando elementos de filtros:');
    console.log('   - Sección de filtros:', hasFilters ? '✅' : '❌');
    console.log('   - Filtro RIF:', hasRifFilter ? '✅' : '❌');
    console.log('   - Filtro Tipo:', hasTipoFilter ? '✅' : '❌');
    
    // Verificar botones de acción
    const hasAddButton = pageContent.includes('Agregar RIF') || pageContent.includes('agregar');
    const hasCsvButton = pageContent.includes('Cargar CSV') || pageContent.includes('csv');
    
    console.log('\n6. Verificando botones de acción:');
    console.log('   - Botón Agregar:', hasAddButton ? '✅' : '❌');
    console.log('   - Botón CSV:', hasCsvButton ? '✅' : '❌');
    
    // Verificar si hay datos renderizados
    const hasDataRendering = pageContent.includes('contribuyente') || pageContent.includes('Contribuyentes');
    const hasLoadingState = pageContent.includes('SkeletonTable') || pageContent.includes('loading');
    
    console.log('\n7. Verificando renderizado de datos:');
    console.log('   - Referencias a contribuyentes:', hasDataRendering ? '✅' : '❌');
    console.log('   - Estado de carga:', hasLoadingState ? '✅' : '❌');
    
    // 8. Probar API directamente para comparar
    console.log('\n8. Comparando con API directa...');
    const apiResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
      headers: {
        'Cookie': authToken
      }
    });
    
    console.log('   - Datos de API:', apiResponse.data.length, 'registros');
    if (apiResponse.data.length > 0) {
      console.log('   - Estructura del primer registro:');
      const firstRecord = apiResponse.data[0];
      Object.keys(firstRecord).forEach(key => {
        console.log(`     * ${key}: ${typeof firstRecord[key]} (${firstRecord[key]})`);
      });
    }
    
    console.log('\n✅ Análisis del frontend completado');
    
    // 9. Resumen de problemas encontrados
    console.log('\n📋 Resumen de problemas encontrados:');
    const issues = [];
    
    if (!hasTableHeader) issues.push('❌ Falta TableHeader en el HTML');
    if (!hasTableBody) issues.push('❌ Falta TableBody en el HTML');
    if (!hasStatsCards) issues.push('❌ Falta cards de estadísticas en el HTML');
    if (!hasFilters) issues.push('❌ Falta sección de filtros en el HTML');
    if (!hasAddButton) issues.push('❌ Falta botón de agregar en el HTML');
    
    if (issues.length === 0) {
      console.log('✅ No se encontraron problemas evidentes en el HTML');
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
testCarteraFrontendRendering(); 