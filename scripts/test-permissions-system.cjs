const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testPermissionsSystem() {
  try {
    console.log('🔐 Probando sistema de permisos corregido...');
    console.log('📍 URL:', BASE_URL);
    
    // 1. Login con usuario ejecutivo
    console.log('\n1️⃣ Login con usuario ejecutivo...');
    const ejecutivoLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'ejecutivo',
      password: 'ejecutivo123'
    });
    
    if (ejecutivoLogin.status !== 200) {
      console.log('❌ Login del ejecutivo falló');
      return;
    }
    
    console.log('✅ Login del ejecutivo exitoso');
    const ejecutivoCookies = ejecutivoLogin.headers['set-cookie'];
    
    // 2. Probar acceso a roles (debería estar restringido)
    console.log('\n2️⃣ Probando acceso a /roles (debería estar restringido)...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/roles`, {
        headers: { 'Cookie': ejecutivoCookies.join('; ') },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('📊 Respuesta de /roles:');
      console.log('   Status:', rolesResponse.status);
      
      if (rolesResponse.status === 200) {
        // Verificar si muestra página de acceso denegado
        const html = rolesResponse.data;
        if (html.includes('Acceso Denegado') || html.includes('No tienes permisos')) {
          console.log('✅ Correctamente restringido - muestra página de acceso denegado');
        } else {
          console.log('❌ Incorrecto - debería mostrar acceso denegado');
        }
      } else {
        console.log('✅ Correctamente restringido - status:', rolesResponse.status);
      }
      
    } catch (error) {
      console.log('✅ Correctamente restringido - error:', error.message);
    }
    
    // 3. Probar acceso a usuarios (debería estar restringido)
    console.log('\n3️⃣ Probando acceso a /usuarios (debería estar restringido)...');
    try {
      const usuariosResponse = await axios.get(`${BASE_URL}/usuarios`, {
        headers: { 'Cookie': ejecutivoCookies.join('; ') },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('📊 Respuesta de /usuarios:');
      console.log('   Status:', usuariosResponse.status);
      
      if (usuariosResponse.status === 200) {
        const html = usuariosResponse.data;
        if (html.includes('Acceso Denegado') || html.includes('No tienes permisos')) {
          console.log('✅ Correctamente restringido - muestra página de acceso denegado');
        } else {
          console.log('❌ Incorrecto - debería mostrar acceso denegado');
        }
      } else {
        console.log('✅ Correctamente restringido - status:', usuariosResponse.status);
      }
      
    } catch (error) {
      console.log('✅ Correctamente restringido - error:', error.message);
    }
    
    // 4. Probar acceso a ejecutivos (debería permitir acceso)
    console.log('\n4️⃣ Probando acceso a /ejecutivos (debería permitir acceso)...');
    try {
      const ejecutivosResponse = await axios.get(`${BASE_URL}/ejecutivos`, {
        headers: { 'Cookie': ejecutivoCookies.join('; ') },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('📊 Respuesta de /ejecutivos:');
      console.log('   Status:', ejecutivosResponse.status);
      
      if (ejecutivosResponse.status === 200) {
        const html = ejecutivosResponse.data;
        if (html.includes('Acceso Denegado') || html.includes('No tienes permisos')) {
          console.log('❌ Incorrecto - no debería mostrar acceso denegado');
        } else {
          console.log('✅ Correcto - permite acceso a ejecutivos');
        }
      } else {
        console.log('❌ Error accediendo a ejecutivos:', ejecutivosResponse.status);
      }
      
    } catch (error) {
      console.log('❌ Error accediendo a ejecutivos:', error.message);
    }
    
    // 5. Probar acceso al dashboard (debería permitir acceso)
    console.log('\n5️⃣ Probando acceso a /dashboard (debería permitir acceso)...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
        headers: { 'Cookie': ejecutivoCookies.join('; ') },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('📊 Respuesta de /dashboard:');
      console.log('   Status:', dashboardResponse.status);
      
      if (dashboardResponse.status === 200) {
        console.log('✅ Correcto - permite acceso al dashboard');
      } else {
        console.log('❌ Error accediendo al dashboard:', dashboardResponse.status);
      }
      
    } catch (error) {
      console.log('❌ Error accediendo al dashboard:', error.message);
    }
    
    console.log('\n🎉 Prueba del sistema de permisos completada!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la prueba
testPermissionsSystem();
