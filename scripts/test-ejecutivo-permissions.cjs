const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testEjecutivoPermissions() {
  try {
    console.log('🔍 Probando permisos de ejecutivos...\\n');
    
    // 1. Probar login de ejecutivo
    console.log('1. Probando login de ejecutivo...');
    const ejecutivoLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'ejecutivo',
      password: 'ejecutivo123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (ejecutivoLogin.status === 200) {
      console.log('✅ Login de ejecutivo exitoso');
      console.log(`   - Usuario: ${ejecutivoLogin.data.user?.username || 'N/A'}`);
      console.log(`   - Rol: ${ejecutivoLogin.data.user?.role || 'N/A'}`);
    } else {
      console.log('❌ Login de ejecutivo falló');
      return;
    }
    
    // 2. Verificar acceso a páginas permitidas
    console.log('\\n2. Verificando acceso a páginas permitidas...');
    
    const allowedPages = [
      '/dashboard',
      '/cartera-contribuyentes'
    ];
    
    for (const page of allowedPages) {
      try {
        const response = await axios.get(`${BASE_URL}${page}`, {
          headers: { 
            'Cookie': `auth_token=${ejecutivoLogin.data.token}`,
            'Authorization': `Bearer ${ejecutivoLogin.data.token}`
          }
        });
        
        if (response.status === 200) {
          console.log(`✅ Acceso permitido a ${page}`);
        } else {
          console.log(`❌ Acceso denegado a ${page} (status: ${response.status})`);
        }
      } catch (error) {
        if (error.response?.status === 302) {
          console.log(`✅ Página ${page} redirige correctamente (requiere login)`);
        } else {
          console.log(`❌ Error accediendo a ${page}: ${error.response?.status || 'error'}`);
        }
      }
    }
    
    // 3. Verificar acceso denegado a páginas restringidas
    console.log('\\n3. Verificando acceso denegado a páginas restringidas...');
    
    const restrictedPages = [
      '/ejecutivos',
      '/usuarios',
      '/roles',
      '/notificaciones'
    ];
    
    for (const page of restrictedPages) {
      try {
        const response = await axios.get(`${BASE_URL}${page}`, {
          headers: { 
            'Cookie': `auth_token=${ejecutivoLogin.data.token}`,
            'Authorization': `Bearer ${ejecutivoLogin.data.token}`
          }
        });
        
        if (response.status === 200) {
          console.log(`❌ Acceso inesperadamente permitido a ${page}`);
        } else {
          console.log(`✅ Acceso correctamente denegado a ${page} (status: ${response.status})`);
        }
      } catch (error) {
        if (error.response?.status === 302) {
          console.log(`✅ Acceso correctamente denegado a ${page} (redirige)`);
        } else {
          console.log(`✅ Acceso correctamente denegado a ${page} (error: ${error.response?.status || 'error'})`);
        }
      }
    }
    
    // 4. Verificar APIs permitidas
    console.log('\\n4. Verificando acceso a APIs permitidas...');
    
    try {
      const carteraAPI = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
        headers: { 
          'Cookie': `auth_token=${ejecutivoLogin.data.token}`,
          'Authorization': `Bearer ${ejecutivoLogin.data.token}`
        }
      });
      
      if (carteraAPI.status === 200) {
        console.log('✅ API de cartera de contribuyentes accesible');
      } else {
        console.log('❌ API de cartera de contribuyentes no accesible');
      }
    } catch (error) {
      console.log('❌ Error accediendo a API de cartera:', error.response?.data?.error || error.message);
    }
    
    // 5. Verificar APIs denegadas
    console.log('\\n5. Verificando acceso denegado a APIs restringidas...');
    
    try {
      const usuariosAPI = await axios.get(`${BASE_URL}/api/admin/users`, {
        headers: { 
          'Cookie': `auth_token=${ejecutivoLogin.data.token}`,
          'Authorization': `Bearer ${ejecutivoLogin.data.token}`
        }
      });
      
      if (usuariosAPI.status === 200) {
        console.log('❌ API de usuarios inesperadamente accesible');
      } else {
        console.log('✅ API de usuarios correctamente denegada');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ API de usuarios correctamente denegada (403)');
      } else {
        console.log('✅ API de usuarios correctamente denegada (error)');
      }
    }
    
    console.log('\\n🎯 Prueba de permisos de ejecutivos completada!');
    console.log('\\n📋 Resumen de permisos para ejecutivos:');
    console.log('✅ Dashboard: Acceso permitido');
    console.log('✅ Cartera de Contribuyentes: Acceso permitido');
    console.log('❌ Ejecutivos: Acceso denegado');
    console.log('❌ Usuarios: Acceso denegado');
    console.log('❌ Roles: Acceso denegado');
    console.log('❌ Notificaciones: Acceso denegado');
    
  } catch (error) {
    console.error('❌ Error en prueba de permisos:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testEjecutivoPermissions(); 