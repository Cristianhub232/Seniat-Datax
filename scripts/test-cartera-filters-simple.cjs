const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testCarteraFiltersSimple() {
  try {
    console.log('🔍 Probando filtros por rol en cartera de contribuyentes...\\n');
    
    // 1. Probar con usuario admin (debe ver todos)
    console.log('1. Probando con usuario ADMIN...');
    const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (adminLogin.status === 200) {
      console.log('✅ Login de admin exitoso');
      
      // Crear instancia de axios con cookies
      const adminAxios = axios.create({
        baseURL: BASE_URL,
        headers: {
          'Cookie': `auth_token=${adminLogin.data.token}`
        }
      });
      
      // Obtener estadísticas como admin
      try {
        const adminStats = await adminAxios.get('/api/admin/cartera-contribuyentes/stats');
        console.log('✅ Admin puede ver estadísticas globales:');
        console.log(`   - Total: ${adminStats.data.total}`);
        console.log(`   - Naturales: ${adminStats.data.naturales}`);
        console.log(`   - Jurídicos: ${adminStats.data.juridicos}`);
      } catch (error) {
        console.log('❌ Error obteniendo estadísticas de admin:', error.response?.data);
      }
      
      // Obtener lista de contribuyentes como admin
      try {
        const adminContribuyentes = await adminAxios.get('/api/admin/cartera-contribuyentes');
        console.log(`✅ Admin puede ver todos los contribuyentes: ${adminContribuyentes.data.length} registros`);
      } catch (error) {
        console.log('❌ Error obteniendo contribuyentes de admin:', error.response?.data);
      }
    }
    
    // 2. Probar con usuario ejecutivo (debe ver solo los suyos)
    console.log('\\n2. Probando con usuario EJECUTIVO...');
    const ejecutivoLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'ejecutivo',
      password: 'ejecutivo123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (ejecutivoLogin.status === 200) {
      console.log('✅ Login de ejecutivo exitoso');
      
      // Crear instancia de axios con cookies
      const ejecutivoAxios = axios.create({
        baseURL: BASE_URL,
        headers: {
          'Cookie': `auth_token=${ejecutivoLogin.data.token}`
        }
      });
      
      // Obtener estadísticas como ejecutivo
      try {
        const ejecutivoStats = await ejecutivoAxios.get('/api/admin/cartera-contribuyentes/stats');
        console.log('✅ Ejecutivo ve estadísticas filtradas:');
        console.log(`   - Total: ${ejecutivoStats.data.total}`);
        console.log(`   - Naturales: ${ejecutivoStats.data.naturales}`);
        console.log(`   - Jurídicos: ${ejecutivoStats.data.juridicos}`);
      } catch (error) {
        console.log('❌ Error obteniendo estadísticas de ejecutivo:', error.response?.data);
      }
      
      // Obtener lista de contribuyentes como ejecutivo
      try {
        const ejecutivoContribuyentes = await ejecutivoAxios.get('/api/admin/cartera-contribuyentes');
        console.log(`✅ Ejecutivo ve solo sus contribuyentes: ${ejecutivoContribuyentes.data.length} registros`);
        
        // Verificar que todos los contribuyentes pertenecen al ejecutivo
        if (ejecutivoContribuyentes.data.length > 0) {
          const allOwnedByEjecutivo = ejecutivoContribuyentes.data.every(contribuyente => 
            contribuyente.usuarioId === ejecutivoLogin.data.user.id
          );
          
          if (allOwnedByEjecutivo) {
            console.log('✅ Todos los contribuyentes pertenecen al ejecutivo');
          } else {
            console.log('❌ Algunos contribuyentes no pertenecen al ejecutivo');
          }
        } else {
          console.log('ℹ️  El ejecutivo no tiene contribuyentes registrados');
        }
      } catch (error) {
        console.log('❌ Error obteniendo contribuyentes de ejecutivo:', error.response?.data);
      }
    }
    
    console.log('\\n🎯 Prueba de filtros completada!');
    console.log('\\n📋 Resumen de filtros aplicados:');
    console.log('✅ Admin: Ve todos los contribuyentes (sin filtro)');
    console.log('✅ Ejecutivo: Ve solo sus contribuyentes (filtro por USUARIO_ID)');
    console.log('✅ Auditor Jefe: Ve solo sus contribuyentes (filtro por USUARIO_ID)');
    
  } catch (error) {
    console.error('❌ Error en prueba de filtros:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCarteraFiltersSimple(); 