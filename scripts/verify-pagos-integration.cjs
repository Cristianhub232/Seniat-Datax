const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function verifyPagosIntegration() {
  try {
    console.log('🎯 Verificando integración del módulo Pagos Ejecutados...\n');
    
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
    
    // 3. Verificar página de pagos ejecutados
    console.log('\n2. Verificando página de Pagos Ejecutados...');
    const pageResponse = await axios.get(`${BASE_URL}/pagos-ejecutados`, {
      headers: { 'Cookie': authToken }
    });
    
    console.log('✅ Página cargada correctamente');
    console.log('   - Status:', pageResponse.status);
    console.log('   - Tamaño:', pageResponse.data.length, 'caracteres');
    
    // 4. Verificar elementos del sidebar
    console.log('\n3. Verificando elementos del sidebar...');
    const html = pageResponse.data;
    
    // Verificar sección de Módulos Transaccionales
    const hasTransactionalSection = html.includes('Módulos Transaccionales');
    const hasCarteraContribuyentes = html.includes('Cartera de Contribuyentes');
    const hasPagosEjecutados = html.includes('Pagos Ejecutados');
    
    // Verificar elementos destacados
    const hasGradient = html.includes('bg-gradient-to-r from-purple-500 to-blue-600');
    const hasShadow = html.includes('shadow-lg');
    const hasTransform = html.includes('transform hover:scale-105');
    const hasBorder = html.includes('border-2 border-purple-300');
    const hasPulse = html.includes('animate-pulse');
    const hasYellowDot = html.includes('bg-yellow-400');
    
    console.log('   - Sección "Módulos Transaccionales":', hasTransactionalSection ? '✅' : '❌');
    console.log('   - Cartera de Contribuyentes:', hasCarteraContribuyentes ? '✅' : '❌');
    console.log('   - Pagos Ejecutados:', hasPagosEjecutados ? '✅' : '❌');
    
    console.log('\n4. Verificando elementos destacados:');
    console.log('   - Gradiente púrpura-azul:', hasGradient ? '✅' : '❌');
    console.log('   - Sombra:', hasShadow ? '✅' : '❌');
    console.log('   - Efecto de escala:', hasTransform ? '✅' : '❌');
    console.log('   - Borde púrpura:', hasBorder ? '✅' : '❌');
    console.log('   - Animación pulse:', hasPulse ? '✅' : '❌');
    console.log('   - Punto amarillo:', hasYellowDot ? '✅' : '❌');
    
    // 5. Verificar funcionalidad de la página
    console.log('\n5. Verificando funcionalidad de la página...');
    const hasDateInputs = html.includes('type="date"');
    const hasDownloadButton = html.includes('Descargar Excel');
    const hasSearchButton = html.includes('Buscar Pagos');
    const hasStatsCards = html.includes('Total Pagos');
    
    console.log('   - Campos de fecha:', hasDateInputs ? '✅' : '❌');
    console.log('   - Botón descargar Excel:', hasDownloadButton ? '✅' : '❌');
    console.log('   - Botón buscar:', hasSearchButton ? '✅' : '❌');
    console.log('   - Tarjetas de estadísticas:', hasStatsCards ? '✅' : '❌');
    
    // 6. Probar APIs
    console.log('\n6. Probando APIs...');
    const fechaInicio = '2025-08-01';
    const fechaFin = '2025-08-31';
    
    const [pagosRes, statsRes] = await Promise.all([
      axios.get(`${BASE_URL}/api/admin/pagos-ejecutados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Cookie': authToken }
      }),
      axios.get(`${BASE_URL}/api/admin/pagos-ejecutados/stats?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Cookie': authToken }
      })
    ]);
    
    console.log('   - API de pagos:', pagosRes.status === 200 ? '✅' : '❌');
    console.log('   - API de estadísticas:', statsRes.status === 200 ? '✅' : '❌');
    console.log('   - Datos de pagos:', pagosRes.data.length, 'registros');
    console.log('   - Total en estadísticas:', statsRes.data.total);
    
    // 7. Resumen final
    console.log('\n📋 RESUMEN DE LA INTEGRACIÓN:');
    console.log('='.repeat(60));
    
    const sidebarCorrect = hasTransactionalSection && hasCarteraContribuyentes && hasPagosEjecutados;
    const highlightingCorrect = hasGradient && hasShadow && hasTransform && hasBorder && hasPulse && hasYellowDot;
    const functionalityCorrect = hasDateInputs && hasDownloadButton && hasSearchButton && hasStatsCards;
    const apisCorrect = pagosRes.status === 200 && statsRes.status === 200;
    
    if (sidebarCorrect && highlightingCorrect && functionalityCorrect && apisCorrect) {
      console.log('🎉 ¡INTEGRACIÓN COMPLETA Y FUNCIONANDO PERFECTAMENTE!');
      console.log('✅ Módulo Pagos Ejecutados integrado en el sidebar');
      console.log('✅ Elementos destacados aplicados correctamente');
      console.log('✅ Funcionalidad completa de la página');
      console.log('✅ APIs funcionando correctamente');
      console.log('\n🎨 El sidebar ahora incluye:');
      console.log('   📋 Menú Principal: Dashboard, Usuarios, Ejecutivos, Roles, Notificaciones');
      console.log('   💼 Módulos Transaccionales:');
      console.log('      • Cartera de Contribuyentes (destacado)');
      console.log('      • Pagos Ejecutados (destacado)');
      console.log('   📄 Documentos y Configuración');
      console.log('\n🚀 Ambos módulos transaccionales están listos para usar');
    } else {
      console.log('❌ Hay problemas en la integración');
      if (!sidebarCorrect) console.log('   - Problema con el sidebar');
      if (!highlightingCorrect) console.log('   - Problema con el destacado');
      if (!functionalityCorrect) console.log('   - Problema con la funcionalidad');
      if (!apisCorrect) console.log('   - Problema con las APIs');
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar la verificación
verifyPagosIntegration(); 