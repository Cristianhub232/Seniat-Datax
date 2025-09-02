#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

async function testLoginRedirect() {
  console.log('🧪 Probando redirección al login...\n');

  try {
    // Probar acceso a la página principal
    console.log('1️⃣ Probando acceso a / (debería redirigir a /login)...');
    const response = await fetch('http://172.16.56.23:3002/', {
      method: 'GET',
      redirect: 'manual', // No seguir redirecciones automáticamente
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      console.log(`   ✅ Redirección detectada a: ${location}`);
      
      if (location && location.includes('/login')) {
        console.log('   🎯 Redirección correcta al login');
      } else {
        console.log('   ❌ Redirección incorrecta');
      }
    } else {
      console.log('   ❌ No se detectó redirección');
    }

    console.log('\n2️⃣ Probando acceso directo a /login...');
    const loginResponse = await fetch('http://172.16.56.23:3002/login', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Página de login accesible');
      
      const html = await loginResponse.text();
      if (html.includes('Iniciar Sesión')) {
        console.log('   ✅ Formulario de login encontrado');
      } else {
        console.log('   ❌ Formulario de login no encontrado');
      }
    } else {
      console.log('   ❌ Error accediendo a la página de login');
    }

    console.log('\n3️⃣ Probando acceso a /dashboard (debería redirigir a /login)...');
    const dashboardResponse = await fetch('http://172.16.56.23:3002/dashboard', {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`   Status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 302 || dashboardResponse.status === 301) {
      const location = dashboardResponse.headers.get('location');
      console.log(`   ✅ Redirección detectada a: ${location}`);
      
      if (location && location.includes('/login')) {
        console.log('   🎯 Redirección correcta al login');
      } else {
        console.log('   ❌ Redirección incorrecta');
      }
    } else {
      console.log('   ❌ No se detectó redirección');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

testLoginRedirect();
