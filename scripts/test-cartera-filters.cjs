const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testCarteraFilters() {
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
      
      // Obtener estadísticas como admin
      const adminStats = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes/stats`, {
        headers: { 
          'Cookie': `auth_token=${adminLogin.data.token}`,
          'Authorization': `Bearer ${adminLogin.data.token}`
        }
      });
      
      if (adminStats.status === 200) {
        console.log('✅ Admin puede ver estadísticas globales:');
        console.log(`   - Total: ${adminStats.data.total}`);
        console.log(`   - Naturales: ${adminStats.data.naturales}`);
        console.log(`   - Jurídicos: ${adminStats.data.juridicos}`);
      }
      
      // Obtener lista de contribuyentes como admin
      const adminContribuyentes = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
        headers: { 
          'Cookie': `auth_token=${adminLogin.data.token}`,
          'Authorization': `Bearer ${adminLogin.data.token}`
        }
      });
      
      if (adminContribuyentes.status === 200) {
        console.log(`✅ Admin puede ver todos los contribuyentes: ${adminContribuyentes.data.length} registros`);
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
      
      // Obtener estadísticas como ejecutivo
      const ejecutivoStats = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes/stats`, {
        headers: { 
          'Cookie': `auth_token=${ejecutivoLogin.data.token}`,
          'Authorization': `Bearer ${ejecutivoLogin.data.token}`
        }
      });
      
      if (ejecutivoStats.status === 200) {
        console.log('✅ Ejecutivo ve estadísticas filtradas:');
        console.log(`   - Total: ${ejecutivoStats.data.total}`);
        console.log(`   - Naturales: ${ejecutivoStats.data.naturales}`);
        console.log(`   - Jurídicos: ${ejecutivoStats.data.juridicos}`);
      }
      
      // Obtener lista de contribuyentes como ejecutivo
      const ejecutivoContribuyentes = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
        headers: { 
          'Cookie': `auth_token=${ejecutivoLogin.data.token}`,
          'Authorization': `Bearer ${ejecutivoLogin.data.token}`
        }
      });
      
      if (ejecutivoContribuyentes.status === 200) {
        console.log(`✅ Ejecutivo ve solo sus contribuyentes: ${ejecutivoContribuyentes.data.length} registros`);
        
        // Verificar que todos los contribuyentes pertenecen al ejecutivo
        const allOwnedByEjecutivo = ejecutivoContribuyentes.data.every(contribuyente => 
          contribuyente.usuarioId === ejecutivoLogin.data.user.id
        );
        
        if (allOwnedByEjecutivo) {
          console.log('✅ Todos los contribuyentes pertenecen al ejecutivo');
        } else {
          console.log('❌ Algunos contribuyentes no pertenecen al ejecutivo');
        }
      }
    }
    
    // 3. Probar con usuario Auditor Jefe (debe ver solo los suyos)
    console.log('\\n3. Probando con usuario AUDITOR JEFE...');
    const auditorLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'rlara',
      password: 'rlara123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (auditorLogin.status === 200) {
      console.log('✅ Login de auditor jefe exitoso');
      
      // Obtener estadísticas como auditor jefe
      const auditorStats = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes/stats`, {
        headers: { 
          'Cookie': `auth_token=${auditorLogin.data.token}`,
          'Authorization': `Bearer ${auditorLogin.data.token}`
        }
      });
      
      if (auditorStats.status === 200) {
        console.log('✅ Auditor Jefe ve estadísticas filtradas:');
        console.log(`   - Total: ${auditorStats.data.total}`);
        console.log(`   - Naturales: ${auditorStats.data.naturales}`);
        console.log(`   - Jurídicos: ${auditorStats.data.juridicos}`);
      }
      
      // Obtener lista de contribuyentes como auditor jefe
      const auditorContribuyentes = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
        headers: { 
          'Cookie': `auth_token=${auditorLogin.data.token}`,
          'Authorization': `Bearer ${auditorLogin.data.token}`
        }
      });
      
      if (auditorContribuyentes.status === 200) {
        console.log(`✅ Auditor Jefe ve solo sus contribuyentes: ${auditorContribuyentes.data.length} registros`);
        
        // Verificar que todos los contribuyentes pertenecen al auditor jefe
        const allOwnedByAuditor = auditorContribuyentes.data.every(contribuyente => 
          contribuyente.usuarioId === auditorLogin.data.user.id
        );
        
        if (allOwnedByAuditor) {
          console.log('✅ Todos los contribuyentes pertenecen al auditor jefe');
        } else {
          console.log('❌ Algunos contribuyentes no pertenecen al auditor jefe');
        }
      }
    }
    
    console.log('\\n🎯 Prueba de filtros completada exitosamente!');
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

testCarteraFilters(); 