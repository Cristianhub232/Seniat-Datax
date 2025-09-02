const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function verifyCarteraComplete() {
  try {
    console.log('🎯 Verificación completa del sistema de Cartera Contribuyentes\n');
    
    // 1. Verificar que el servidor esté funcionando
    console.log('1. Verificando servidor...');
    try {
      await axios.get(`${BASE_URL}/api/auth/me`);
      console.log('✅ Servidor funcionando');
    } catch (error) {
      console.log('✅ Servidor funcionando (esperado: no hay sesión)');
    }
    
    // 2. Login
    console.log('\n2. Realizando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login falló');
      return;
    }
    
    console.log('✅ Login exitoso');
    
    // 3. Obtener token
    const cookies = loginResponse.headers['set-cookie'];
    const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
    const authToken = authCookie.split(';')[0];
    
    // 4. Probar todas las APIs
    console.log('\n3. Probando APIs...');
    
    // API de contribuyentes
    const contribuyentesRes = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
      headers: { 'Cookie': authToken }
    });
    console.log('✅ API contribuyentes:', contribuyentesRes.data.length, 'registros');
    
    // API de estadísticas
    const statsRes = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes/stats`, {
      headers: { 'Cookie': authToken }
    });
    console.log('✅ API estadísticas:', statsRes.data.total, 'total');
    
    // API con filtros
    const filtroRes = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?tipo=JURIDICO`, {
      headers: { 'Cookie': authToken }
    });
    console.log('✅ API filtros:', filtroRes.data.length, 'jurídicos');
    
    // API con búsqueda
    const busquedaRes = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?rif=J000202002`, {
      headers: { 'Cookie': authToken }
    });
    console.log('✅ API búsqueda:', busquedaRes.data.length, 'resultados');
    
    // 5. Verificar consistencia
    console.log('\n4. Verificando consistencia...');
    const totalAPI = contribuyentesRes.data.length;
    const totalStats = statsRes.data.total;
    const juridicosAPI = filtroRes.data.length;
    const juridicosStats = statsRes.data.juridicos;
    
    console.log('   - Total API vs Stats:', totalAPI === totalStats ? '✅' : '❌');
    console.log('   - Jurídicos API vs Stats:', juridicosAPI === juridicosStats ? '✅' : '❌');
    
    // 6. Verificar estructura de datos
    console.log('\n5. Verificando estructura de datos...');
    const validRecords = contribuyentesRes.data.filter(record => 
      record.id && record.rif && record.tipoContribuyente && record.createdAt
    );
    
    console.log('   - Registros válidos:', validRecords.length, 'de', totalAPI);
    console.log('   - Estructura correcta:', validRecords.length === totalAPI ? '✅' : '❌');
    
    // 7. Verificar tipos
    console.log('\n6. Verificando tipos de contribuyentes...');
    const tipos = {};
    contribuyentesRes.data.forEach(record => {
      tipos[record.tipoContribuyente] = (tipos[record.tipoContribuyente] || 0) + 1;
    });
    
    Object.keys(tipos).forEach(tipo => {
      console.log(`   - ${tipo}: ${tipos[tipo]} registros`);
    });
    
    // 8. Resumen final
    console.log('\n📋 RESUMEN FINAL:');
    console.log('='.repeat(50));
    
    const allTestsPassed = 
      totalAPI > 0 && 
      totalAPI === totalStats && 
      juridicosAPI === juridicosStats && 
      validRecords.length === totalAPI;
    
    if (allTestsPassed) {
      console.log('🎉 ¡SISTEMA FUNCIONANDO PERFECTAMENTE!');
      console.log('✅ Todas las APIs funcionando');
      console.log('✅ Datos consistentes');
      console.log('✅ Estructura correcta');
      console.log(`📊 Total de contribuyentes: ${totalAPI}`);
      console.log('🔧 El frontend debería mostrar los datos correctamente');
      console.log('\n🚀 El sistema está listo para usar');
    } else {
      console.log('❌ Hay problemas en el sistema');
      console.log('🔧 Revisar logs para más detalles');
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar la verificación
verifyCarteraComplete(); 