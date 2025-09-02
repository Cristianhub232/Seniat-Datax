const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function verifyPagosSidebar() {
  try {
    console.log('🔍 Verificando que Pagos Ejecutados aparezca en el sidebar...\n');
    
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
    
    // 3. Verificar página principal
    console.log('\n2. Verificando página principal...');
    const pageResponse = await axios.get(`${BASE_URL}/dashboard`, {
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
    
    // 5. Verificar otros elementos del menú
    console.log('\n5. Verificando otros elementos del menú:');
    const hasDashboard = html.includes('Dashboard');
    const hasUsuarios = html.includes('Usuarios');
    const hasEjecutivos = html.includes('Ejecutivos');
    const hasRoles = html.includes('Roles');
    const hasNotificaciones = html.includes('Notificaciones');
    
    console.log('   - Dashboard:', hasDashboard ? '✅' : '❌');
    console.log('   - Usuarios:', hasUsuarios ? '✅' : '❌');
    console.log('   - Ejecutivos:', hasEjecutivos ? '✅' : '❌');
    console.log('   - Roles:', hasRoles ? '✅' : '❌');
    console.log('   - Notificaciones:', hasNotificaciones ? '✅' : '❌');
    
    // 6. Verificar que la página de pagos ejecutados sea accesible
    console.log('\n6. Verificando acceso a la página de Pagos Ejecutados...');
    const pagosPageResponse = await axios.get(`${BASE_URL}/pagos-ejecutados`, {
      headers: { 'Cookie': authToken }
    });
    
    console.log('   - Página Pagos Ejecutados:', pagosPageResponse.status === 200 ? '✅' : '❌');
    
    // 7. Resumen final
    console.log('\n📋 RESUMEN DE LA VERIFICACIÓN:');
    console.log('='.repeat(60));
    
    const sidebarCorrect = hasTransactionalSection && hasCarteraContribuyentes && hasPagosEjecutados;
    const highlightingCorrect = hasGradient && hasShadow && hasTransform && hasBorder && hasPulse && hasYellowDot;
    const otherMenusPresent = hasDashboard && hasUsuarios && hasEjecutivos && hasRoles && hasNotificaciones;
    const pageAccessible = pagosPageResponse.status === 200;
    
    if (sidebarCorrect && highlightingCorrect && otherMenusPresent && pageAccessible) {
      console.log('🎉 ¡PAGOS EJECUTADOS INTEGRADO CORRECTAMENTE!');
      console.log('✅ Botón de Pagos Ejecutados visible en el sidebar');
      console.log('✅ Elementos destacados aplicados correctamente');
      console.log('✅ Otros elementos del menú preservados');
      console.log('✅ Página accesible correctamente');
      console.log('\n🎨 El sidebar ahora incluye:');
      console.log('   📋 Menú Principal: Dashboard, Usuarios, Ejecutivos, Roles, Notificaciones');
      console.log('   💼 Módulos Transaccionales:');
      console.log('      • Cartera de Contribuyentes (destacado)');
      console.log('      • Pagos Ejecutados (destacado)');
      console.log('   📄 Documentos y Configuración');
    } else {
      console.log('❌ Hay problemas en la integración');
      if (!sidebarCorrect) console.log('   - Problema con el sidebar');
      if (!highlightingCorrect) console.log('   - Problema con el destacado');
      if (!otherMenusPresent) console.log('   - Problema con otros menús');
      if (!pageAccessible) console.log('   - Problema con acceso a la página');
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
verifyPagosSidebar(); 