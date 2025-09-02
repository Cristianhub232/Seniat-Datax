const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Probando login con usuario administrador...');
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    console.log('📋 Datos de login:');
    console.log('   Usuario:', loginData.username);
    console.log('   Contraseña:', loginData.password);
    
    const response = await axios.post('http://localhost:3002/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login exitoso!');
    console.log('📋 Respuesta del servidor:');
    console.log('   Status:', response.status);
    console.log('   Usuario:', response.data.user.username);
    console.log('   Email:', response.data.user.email);
    console.log('   Rol:', response.data.user.role);
    console.log('   Permisos:', response.data.user.permissions);
    
    // Verificar cookie
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      console.log('🍪 Cookie de autenticación establecida');
    }
    
  } catch (error) {
    console.error('❌ Error en el login:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data.error);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testLogin(); 