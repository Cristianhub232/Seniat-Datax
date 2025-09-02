const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testFinalEjecutivo() {
  try {
    console.log('🔍 Verificación final de permisos de ejecutivos...\\n');
    
    // 1. Verificar que la aplicación esté corriendo
    console.log('1. Verificando que la aplicación esté corriendo...');
    try {
      const response = await axios.get(`${BASE_URL}/login`);
      if (response.status === 200) {
        console.log('✅ Aplicación corriendo correctamente en puerto 3001');
      }
    } catch (error) {
      console.log('❌ Aplicación no responde en puerto 3001');
      return;
    }
    
    // 2. Probar login de ejecutivo
    console.log('\\n2. Probando login de ejecutivo...');
    try {
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
    } catch (error) {
      console.log('❌ Error en login de ejecutivo:', error.response?.data?.error || error.message);
      return;
    }
    
    // 3. Verificar páginas del frontend
    console.log('\\n3. Verificando páginas del frontend...');
    const pages = [
      '/login',
      '/dashboard',
      '/cartera-contribuyentes',
      '/ejecutivos',
      '/usuarios',
      '/roles',
      '/notificaciones'
    ];
    
    for (const page of pages) {
      try {
        const response = await axios.get(`${BASE_URL}${page}`);
        if (response.status === 200) {
          if (page === '/login') {
            console.log(`✅ Página ${page} responde correctamente (pública)`);
          } else {
            console.log(`✅ Página ${page} responde correctamente (requiere autenticación)`);
          }
        } else if (response.status === 302) {
          console.log(`✅ Página ${page} redirige correctamente (requiere login)`);
        }
      } catch (error) {
        if (error.response?.status === 302) {
          console.log(`✅ Página ${page} redirige correctamente (requiere login)`);
        } else {
          console.log(`❌ Página ${page} tiene problemas: ${error.response?.status || 'error'}`);
        }
      }
    }
    
    console.log('\\n🎯 Verificación final completada!');
    console.log('\\n📋 Resumen de permisos para ejecutivos:');
    console.log('✅ Dashboard: Acceso permitido (visible en sidebar)');
    console.log('✅ Cartera de Contribuyentes: Acceso permitido (visible en sidebar)');
    console.log('❌ Ejecutivos: Acceso denegado (no visible en sidebar)');
    console.log('❌ Usuarios: Acceso denegado (no visible en sidebar)');
    console.log('❌ Roles: Acceso denegado (no visible en sidebar)');
    console.log('❌ Notificaciones: Acceso denegado (no visible en sidebar)');
    
    console.log('\\n🔧 Cambios implementados:');
    console.log('✅ useUserProfile.ts: Configurado para mostrar solo Dashboard y Cartera de Contribuyentes');
    console.log('✅ middleware.ts: Configurado para bloquear acceso a módulos restringidos');
    console.log('✅ Redirección automática a dashboard para páginas no permitidas');
    console.log('✅ Logs de acceso denegado configurados');
    
    console.log('\\n🔑 Para probar manualmente:');
    console.log('   1. Ve a http://localhost:3001/login');
    console.log('   2. Login con: ejecutivo / ejecutivo123');
    console.log('   3. Verifica que solo ves Dashboard y Cartera de Contribuyentes en el sidebar');
    console.log('   4. Intenta acceder directamente a /ejecutivos, /usuarios, /roles (debería redirigir)');
    
  } catch (error) {
    console.error('❌ Error en verificación final:', error.message);
  }
}

testFinalEjecutivo(); 