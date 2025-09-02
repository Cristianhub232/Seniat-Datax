const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testCarteraClientSide() {
  try {
    console.log('🧪 Probando renderizado del lado del cliente...\n');
    
    // 1. Intentar login para obtener token
    console.log('1. Intentando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login falló:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login exitoso');
    
    // 2. Obtener cookies del login
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      console.log('❌ No se obtuvieron cookies del login');
      return;
    }
    
    // Extraer auth_token de las cookies
    const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
    if (!authCookie) {
      console.log('❌ No se encontró auth_token en las cookies');
      return;
    }
    
    const authToken = authCookie.split(';')[0];
    console.log('✅ Token obtenido:', authToken.substring(0, 50) + '...');
    
    // 3. Probar API de contribuyentes con diferentes filtros
    console.log('\n2. Probando API con diferentes filtros...');
    
    // Sin filtros
    const allResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes`, {
      headers: { 'Cookie': authToken }
    });
    console.log('   - Sin filtros:', allResponse.data.length, 'registros');
    
    // Con filtro de tipo
    const juridicosResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?tipo=JURIDICO`, {
      headers: { 'Cookie': authToken }
    });
    console.log('   - Solo jurídicos:', juridicosResponse.data.length, 'registros');
    
    // Con filtro de RIF
    const rifResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?rif=J000202002`, {
      headers: { 'Cookie': authToken }
    });
    console.log('   - RIF específico:', rifResponse.data.length, 'registros');
    
    // 4. Verificar estructura de datos detallada
    console.log('\n3. Verificando estructura de datos...');
    if (allResponse.data.length > 0) {
      const sample = allResponse.data[0];
      console.log('   - Muestra del primer registro:');
      console.log('     * ID:', sample.id);
      console.log('     * RIF:', sample.rif);
      console.log('     * Tipo:', sample.tipoContribuyente);
      console.log('     * Usuario ID:', sample.usuarioId);
      console.log('     * Creado:', sample.createdAt);
      console.log('     * Usuario objeto:', sample.usuario ? 'Presente' : 'Ausente');
      
      if (sample.usuario) {
        console.log('       - Username:', sample.usuario.username);
        console.log('       - First Name:', sample.usuario.firstName);
        console.log('       - Last Name:', sample.usuario.lastName);
      }
    }
    
    // 5. Verificar que todos los registros tengan la estructura correcta
    console.log('\n4. Verificando consistencia de datos...');
    const validRecords = allResponse.data.filter(record => 
      record.id && 
      record.rif && 
      record.tipoContribuyente && 
      record.createdAt
    );
    
    console.log('   - Registros válidos:', validRecords.length, 'de', allResponse.data.length);
    
    // 6. Verificar tipos de contribuyentes
    console.log('\n5. Verificando tipos de contribuyentes...');
    const tipos = {};
    allResponse.data.forEach(record => {
      const tipo = record.tipoContribuyente;
      tipos[tipo] = (tipos[tipo] || 0) + 1;
    });
    
    Object.keys(tipos).forEach(tipo => {
      console.log(`   - ${tipo}: ${tipos[tipo]} registros`);
    });
    
    // 7. Verificar usuarios asociados
    console.log('\n6. Verificando usuarios asociados...');
    const withUser = allResponse.data.filter(record => record.usuario);
    const withoutUser = allResponse.data.filter(record => !record.usuario);
    
    console.log('   - Con usuario:', withUser.length, 'registros');
    console.log('   - Sin usuario:', withoutUser.length, 'registros');
    
    // 8. Probar estadísticas
    console.log('\n7. Verificando estadísticas...');
    const statsResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes/stats`, {
      headers: { 'Cookie': authToken }
    });
    
    console.log('   - Total en stats:', statsResponse.data.total);
    console.log('   - Total en datos:', allResponse.data.length);
    console.log('   - Coinciden:', statsResponse.data.total === allResponse.data.length ? '✅' : '❌');
    
    console.log('\n✅ Análisis del lado del cliente completado');
    
    // 9. Resumen de problemas
    console.log('\n📋 Resumen de problemas encontrados:');
    const issues = [];
    
    if (validRecords.length !== allResponse.data.length) {
      issues.push(`❌ ${allResponse.data.length - validRecords.length} registros tienen estructura inválida`);
    }
    
    if (withoutUser.length > 0) {
      issues.push(`❌ ${withoutUser.length} registros no tienen usuario asociado`);
    }
    
    if (statsResponse.data.total !== allResponse.data.length) {
      issues.push('❌ Las estadísticas no coinciden con los datos');
    }
    
    if (issues.length === 0) {
      console.log('✅ No se encontraron problemas en los datos');
    } else {
      issues.forEach(issue => console.log(issue));
    }
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testCarteraClientSide(); 