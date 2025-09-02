const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugUserRole() {
  try {
    console.log('🔍 Debuggeando role_id del usuario ejecutivo...');
    
    // 1. Login con ejecutivo
    console.log('\n1️⃣ Login con ejecutivo...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'ejecutivo',
      password: 'ejecutivo123'
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login falló');
      return;
    }
    
    console.log('✅ Login exitoso');
    console.log('📊 Respuesta del login:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
    
    // 2. Verificar cookies
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      console.log('❌ No se recibieron cookies');
      return;
    }
    
    console.log('\n2️⃣ Cookies recibidas:');
    cookies.forEach((cookie, index) => {
      console.log(`   ${index + 1}. ${cookie}`);
    });
    
    // 3. Verificar API /api/me para obtener datos del usuario
    console.log('\n3️⃣ Verificando /api/me...');
    try {
      const meResponse = await axios.get(`${BASE_URL}/api/me`, {
        headers: { 'Cookie': cookies.join('; ') }
      });
      
      console.log('📊 Respuesta de /api/me:');
      console.log('   Status:', meResponse.status);
      if (meResponse.data) {
        console.log('   Data:', JSON.stringify(meResponse.data, null, 2));
      }
      
    } catch (error) {
      console.log('❌ Error en /api/me:', error.message);
    }
    
    // 4. Verificar página de ejecutivos
    console.log('\n4️⃣ Verificando página de ejecutivos...');
    try {
      const ejecutivosResponse = await axios.get(`${BASE_URL}/ejecutivos`, {
        headers: { 'Cookie': cookies.join('; ') },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('📊 Respuesta de /ejecutivos:');
      console.log('   Status:', ejecutivosResponse.status);
      
      if (ejecutivosResponse.status === 200) {
        const html = ejecutivosResponse.data;
        if (html.includes('Acceso Denegado')) {
          console.log('❌ Muestra acceso denegado');
          // Buscar información de debug en el HTML
          if (html.includes('role_id')) {
            console.log('🔍 HTML contiene información de role_id');
          }
        } else {
          console.log('✅ Permite acceso');
        }
      }
      
    } catch (error) {
      console.log('❌ Error en /ejecutivos:', error.message);
    }
    
    console.log('\n🎉 Debug completado!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugUserRole();
