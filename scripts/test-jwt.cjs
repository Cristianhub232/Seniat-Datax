require('dotenv').config({ path: '.env.local' });

const jwt = require('jsonwebtoken');

async function testJWT() {
  try {
    console.log('🔍 Probando generación de JWT...');
    
    // Verificar variables de entorno
    console.log('🔧 Variables de entorno:');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurada' : '❌ No configurada');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no está configurada');
      return;
    }
    
    // Probar generación de token
    const payload = {
      id: 'test-user-id',
      role: 'admin'
    };
    
    console.log('\n📝 Payload:', payload);
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: process.env.NODE_ENV !== "production" ? "12h" : "1h" 
    });
    
    console.log('✅ Token generado:', token.substring(0, 50) + '...');
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verificado:', decoded);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testJWT(); 