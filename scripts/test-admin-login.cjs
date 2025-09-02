const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAdminLogin() {
  try {
    console.log('🔐 Probando login con usuario ADMIN...');
    console.log('📍 URL:', BASE_URL);
    
    // 1. Verificar que la aplicación esté respondiendo
    console.log('\n1️⃣ Verificando disponibilidad de la aplicación...');
    try {
      const homeResponse = await axios.get(`${BASE_URL}/`);
      console.log('✅ Aplicación respondiendo en /');
      console.log('   Status:', homeResponse.status);
      console.log('   Título:', homeResponse.data.includes('SENIAT DataFiscal') ? '✅ Correcto' : '❌ Incorrecto');
    } catch (error) {
      console.log('❌ Error accediendo a /:', error.message);
      return;
    }
    
    // 2. Verificar página de login
    console.log('\n2️⃣ Verificando página de login...');
    try {
      const loginResponse = await axios.get(`${BASE_URL}/login`);
      console.log('✅ Página de login accesible');
      console.log('   Status:', loginResponse.status);
      console.log('   Contiene formulario:', loginResponse.data.includes('form') ? '✅ Sí' : '❌ No');
    } catch (error) {
      console.log('❌ Error accediendo a /login:', error.message);
      return;
    }
    
    // 3. Intentar login con admin/admin123
    console.log('\n3️⃣ Intentando login con admin/admin123...');
    try {
      const loginData = {
        username: 'admin',
        password: 'admin123'
      };
      
      console.log('📤 Enviando credenciales:', { username: loginData.username, password: '***' });
      
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Script/1.0'
        },
        validateStatus: function (status) {
          return status < 500; // Aceptar cualquier status < 500 para ver la respuesta
        }
      });
      
      console.log('📥 Respuesta del servidor:');
      console.log('   Status:', loginResponse.status);
      console.log('   Headers:', loginResponse.headers);
      
      if (loginResponse.data) {
        console.log('   Data:', JSON.stringify(loginResponse.data, null, 2));
      }
      
      // 4. Verificar cookies de autenticación
      console.log('\n4️⃣ Verificando cookies de autenticación...');
      const cookies = loginResponse.headers['set-cookie'];
      if (cookies) {
        console.log('🍪 Cookies recibidas:');
        cookies.forEach((cookie, index) => {
          console.log(`   ${index + 1}. ${cookie}`);
        });
        
        // 5. Intentar acceder al dashboard con las cookies
        console.log('\n5️⃣ Intentando acceder al dashboard...');
        try {
          const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
            headers: {
              'Cookie': cookies.join('; ')
            },
            validateStatus: function (status) {
              return status < 500;
            }
          });
          
          console.log('📊 Respuesta del dashboard:');
          console.log('   Status:', dashboardResponse.status);
          console.log('   Tamaño respuesta:', dashboardResponse.data.length, 'caracteres');
          
          if (dashboardResponse.status === 200) {
            console.log('✅ Dashboard accesible después del login');
            console.log('   Contiene elementos del dashboard:', dashboardResponse.data.includes('dashboard') ? '✅ Sí' : '❌ No');
          } else {
            console.log('⚠️ Dashboard no accesible (status:', dashboardResponse.status, ')');
          }
          
        } catch (dashboardError) {
          console.log('❌ Error accediendo al dashboard:', dashboardError.message);
        }
        
      } else {
        console.log('⚠️ No se recibieron cookies de autenticación');
      }
      
    } catch (loginError) {
      console.log('❌ Error en el login:', loginError.message);
      if (loginError.response) {
        console.log('   Status:', loginError.response.status);
        console.log('   Data:', loginError.response.data);
      }
    }
    
    // 6. Verificar estado de la base de datos
    console.log('\n6️⃣ Verificando estado de la base de datos...');
    try {
      const dbTestResponse = await axios.get(`${BASE_URL}/api/admin/roles`, {
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('📊 Estado de la API de roles:');
      console.log('   Status:', dbTestResponse.status);
      if (dbTestResponse.status === 401) {
        console.log('   🔒 API protegida (requiere autenticación)');
      } else if (dbTestResponse.status === 200) {
        console.log('   ✅ API accesible');
        console.log('   Roles disponibles:', dbTestResponse.data.roles?.length || 0);
      } else {
        console.log('   ⚠️ Status inesperado:', dbTestResponse.status);
      }
      
    } catch (dbError) {
      console.log('❌ Error verificando API de roles:', dbError.message);
    }
    
    console.log('\n🎉 Prueba de login completada!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la prueba
testAdminLogin(); 