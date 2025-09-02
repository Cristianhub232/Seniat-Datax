const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testSidebarHighlight() {
  try {
    console.log('🎨 Verificando destacado del botón Cartera de Contribuyentes...\n');
    
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
    
    // 4. Verificar elementos del sidebar destacado
    console.log('\n3. Verificando elementos destacados...');
    const html = pageResponse.data;
    
    // Verificar clases CSS específicas del destacado
    const hasGradient = html.includes('bg-gradient-to-r from-purple-500 to-blue-600');
    const hasShadow = html.includes('shadow-lg');
    const hasTransform = html.includes('transform hover:scale-105');
    const hasBorder = html.includes('border-2 border-purple-300');
    const hasPulse = html.includes('animate-pulse');
    const hasYellowDot = html.includes('bg-yellow-400');
    
    console.log('   - Gradiente púrpura-azul:', hasGradient ? '✅' : '❌');
    console.log('   - Sombra:', hasShadow ? '✅' : '❌');
    console.log('   - Efecto de escala:', hasTransform ? '✅' : '❌');
    console.log('   - Borde púrpura:', hasBorder ? '✅' : '❌');
    console.log('   - Animación pulse:', hasPulse ? '✅' : '❌');
    console.log('   - Punto amarillo:', hasYellowDot ? '✅' : '❌');
    
    // 5. Verificar texto específico
    console.log('\n4. Verificando contenido...');
    const hasCarteraText = html.includes('Cartera de Contribuyentes');
    const hasIconBuilding = html.includes('IconBuilding');
    
    console.log('   - Texto "Cartera de Contribuyentes":', hasCarteraText ? '✅' : '❌');
    console.log('   - Icono de edificio:', hasIconBuilding ? '✅' : '❌');
    
    // 6. Resumen final
    console.log('\n📋 RESUMEN DEL DESTACADO:');
    console.log('='.repeat(50));
    
    const allElementsPresent = hasGradient && hasShadow && hasTransform && hasBorder && hasPulse && hasYellowDot && hasCarteraText;
    
    if (allElementsPresent) {
      console.log('🎉 ¡BOTÓN DESTACADO APLICADO CORRECTAMENTE!');
      console.log('✅ Gradiente púrpura-azul aplicado');
      console.log('✅ Sombra y efectos visuales activos');
      console.log('✅ Animación de pulso en punto amarillo');
      console.log('✅ Efecto de escala al hover');
      console.log('✅ Borde púrpura distintivo');
      console.log('\n🎨 El botón de Cartera de Contribuyentes ahora se destaca visualmente');
    } else {
      console.log('❌ Algunos elementos del destacado no se aplicaron correctamente');
      console.log('🔧 Revisar la implementación del CSS');
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar la verificación
testSidebarHighlight(); 