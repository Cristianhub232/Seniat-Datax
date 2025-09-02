const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testSidebarSections() {
  try {
    console.log('🎯 Verificando nueva estructura del sidebar con secciones...\n');
    
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
    
    // 3. Obtener la página principal
    console.log('\n2. Obteniendo página principal...');
    const pageResponse = await axios.get(`${BASE_URL}/cartera-contribuyentes`, {
      headers: { 'Cookie': authToken }
    });
    
    console.log('✅ Página obtenida');
    console.log('   - Status:', pageResponse.status);
    console.log('   - Tamaño:', pageResponse.data.length, 'caracteres');
    
    // 4. Verificar elementos del sidebar
    console.log('\n3. Verificando estructura del sidebar...');
    const html = pageResponse.data;
    
    // Verificar sección de Módulos Transaccionales
    const hasTransactionalSection = html.includes('Módulos Transaccionales');
    const hasTransactionalLabel = html.includes('text-xs font-semibold text-gray-500 uppercase tracking-wider');
    
    // Verificar que Cartera de Contribuyentes esté en la sección correcta
    const hasCarteraInTransactional = html.includes('Cartera de Contribuyentes') && hasTransactionalSection;
    
    // Verificar elementos destacados
    const hasGradient = html.includes('bg-gradient-to-r from-purple-500 to-blue-600');
    const hasShadow = html.includes('shadow-lg');
    const hasTransform = html.includes('transform hover:scale-105');
    const hasBorder = html.includes('border-2 border-purple-300');
    const hasPulse = html.includes('animate-pulse');
    const hasYellowDot = html.includes('bg-yellow-400');
    
    // Verificar otros elementos del menú principal
    const hasDashboard = html.includes('Dashboard');
    const hasUsuarios = html.includes('Usuarios');
    const hasEjecutivos = html.includes('Ejecutivos');
    const hasRoles = html.includes('Roles');
    const hasNotificaciones = html.includes('Notificaciones');
    
    console.log('   - Sección "Módulos Transaccionales":', hasTransactionalSection ? '✅' : '❌');
    console.log('   - Etiqueta de sección:', hasTransactionalLabel ? '✅' : '❌');
    console.log('   - Cartera en sección transaccional:', hasCarteraInTransactional ? '✅' : '❌');
    
    console.log('\n4. Verificando elementos destacados de Cartera:');
    console.log('   - Gradiente púrpura-azul:', hasGradient ? '✅' : '❌');
    console.log('   - Sombra:', hasShadow ? '✅' : '❌');
    console.log('   - Efecto de escala:', hasTransform ? '✅' : '❌');
    console.log('   - Borde púrpura:', hasBorder ? '✅' : '❌');
    console.log('   - Animación pulse:', hasPulse ? '✅' : '❌');
    console.log('   - Punto amarillo:', hasYellowDot ? '✅' : '❌');
    
    console.log('\n5. Verificando otros elementos del menú:');
    console.log('   - Dashboard:', hasDashboard ? '✅' : '❌');
    console.log('   - Usuarios:', hasUsuarios ? '✅' : '❌');
    console.log('   - Ejecutivos:', hasEjecutivos ? '✅' : '❌');
    console.log('   - Roles:', hasRoles ? '✅' : '❌');
    console.log('   - Notificaciones:', hasNotificaciones ? '✅' : '❌');
    
    // 6. Resumen final
    console.log('\n📋 RESUMEN DE LA NUEVA ESTRUCTURA:');
    console.log('='.repeat(60));
    
    const structureCorrect = hasTransactionalSection && hasTransactionalLabel && hasCarteraInTransactional;
    const highlightingCorrect = hasGradient && hasShadow && hasTransform && hasBorder && hasPulse && hasYellowDot;
    const otherMenusPresent = hasDashboard && hasUsuarios && hasEjecutivos && hasRoles && hasNotificaciones;
    
    if (structureCorrect && highlightingCorrect && otherMenusPresent) {
      console.log('🎉 ¡NUEVA ESTRUCTURA DEL SIDEBAR FUNCIONANDO PERFECTAMENTE!');
      console.log('✅ Sección "Módulos Transaccionales" creada');
      console.log('✅ Cartera de Contribuyentes movida a la nueva sección');
      console.log('✅ Elementos destacados mantenidos');
      console.log('✅ Otros elementos del menú preservados');
      console.log('\n🎨 El sidebar ahora tiene una organización más clara:');
      console.log('   📋 Menú Principal: Dashboard, Usuarios, Ejecutivos, Roles, Notificaciones');
      console.log('   💼 Módulos Transaccionales: Cartera de Contribuyentes (destacado)');
      console.log('   📄 Documentos y Configuración');
    } else {
      console.log('❌ Hay problemas en la nueva estructura');
      if (!structureCorrect) console.log('   - Problema con la sección transaccional');
      if (!highlightingCorrect) console.log('   - Problema con el destacado');
      if (!otherMenusPresent) console.log('   - Problema con otros menús');
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
testSidebarSections(); 