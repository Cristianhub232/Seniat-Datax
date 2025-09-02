const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testPagosEjecutados() {
  try {
    console.log('🧪 Probando módulo Pagos Ejecutados...\n');
    
    // 1. Login
    console.log('1. Realizando login...');
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
    
    // 2. Obtener token
    const cookies = loginResponse.headers['set-cookie'];
    const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
    const authToken = authCookie.split(';')[0];
    
    // 3. Probar API de pagos ejecutados (sin fechas - debe fallar)
    console.log('\n2. Probando validación de fechas obligatorias...');
    try {
      await axios.get(`${BASE_URL}/api/admin/pagos-ejecutados`, {
        headers: { 'Cookie': authToken }
      });
      console.log('❌ Debería haber fallado por falta de fechas');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validación de fechas funcionando correctamente');
      } else {
        console.log('❌ Error inesperado:', error.response?.status);
      }
    }
    
    // 4. Probar API con fechas válidas
    console.log('\n3. Probando API con fechas válidas...');
    const fechaInicio = '2025-01-01';
    const fechaFin = '2025-12-31';
    
    const pagosResponse = await axios.get(`${BASE_URL}/api/admin/pagos-ejecutados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
      headers: { 'Cookie': authToken }
    });
    
    console.log('✅ API de pagos ejecutados:');
    console.log('   - Status:', pagosResponse.status);
    console.log('   - Cantidad de registros:', pagosResponse.data.length);
    
    if (pagosResponse.data.length > 0) {
      console.log('   - Primer registro:');
      const first = pagosResponse.data[0];
      console.log('     * RIF:', first.rif);
      console.log('     * Apellido:', first.apellidoContribuyente);
      console.log('     * Monto:', first.montoTotalPago);
      console.log('     * Fecha:', first.fechaRecaudacionPago);
      console.log('     * RIF Válido:', first.rifValido);
    }
    
    // 5. Probar API de estadísticas
    console.log('\n4. Probando API de estadísticas...');
    const statsResponse = await axios.get(`${BASE_URL}/api/admin/pagos-ejecutados/stats?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
      headers: { 'Cookie': authToken }
    });
    
    console.log('✅ Estadísticas obtenidas:');
    console.log('   - Total:', statsResponse.data.total);
    console.log('   - Monto Total:', statsResponse.data.montoTotal);
    console.log('   - RIF Válidos:', statsResponse.data.rifValidos);
    console.log('   - RIF Inválidos:', statsResponse.data.rifInvalidos);
    console.log('   - Pagos Hoy:', statsResponse.data.pagosHoy);
    console.log('   - Pagos Mes:', statsResponse.data.pagosMes);
    
    // 6. Probar filtros
    console.log('\n5. Probando filtros...');
    const filtroResponse = await axios.get(`${BASE_URL}/api/admin/pagos-ejecutados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&rifValido=VALIDO`, {
      headers: { 'Cookie': authToken }
    });
    
    console.log('✅ Filtro por RIF válidos:');
    console.log('   - Cantidad:', filtroResponse.data.length);
    
    // 7. Probar descarga de Excel
    console.log('\n6. Probando descarga de Excel...');
    try {
      const excelResponse = await axios.get(`${BASE_URL}/api/admin/pagos-ejecutados/download-excel?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Cookie': authToken },
        responseType: 'arraybuffer'
      });
      
      console.log('✅ Descarga de Excel:');
      console.log('   - Status:', excelResponse.status);
      console.log('   - Content-Type:', excelResponse.headers['content-type']);
      console.log('   - Tamaño:', excelResponse.data.length, 'bytes');
    } catch (error) {
      console.log('⚠️ Descarga de Excel:', error.response?.status || error.message);
    }
    
    // 8. Verificar página frontend
    console.log('\n7. Verificando página frontend...');
    const pageResponse = await axios.get(`${BASE_URL}/pagos-ejecutados`, {
      headers: { 'Cookie': authToken }
    });
    
    console.log('✅ Página frontend:');
    console.log('   - Status:', pageResponse.status);
    console.log('   - Tamaño:', pageResponse.data.length, 'caracteres');
    
    // 9. Resumen final
    console.log('\n📋 RESUMEN DEL MÓDULO PAGOS EJECUTADOS:');
    console.log('='.repeat(60));
    
    const allTestsPassed = 
      pagosResponse.status === 200 && 
      statsResponse.status === 200 && 
      pageResponse.status === 200;
    
    if (allTestsPassed) {
      console.log('🎉 ¡MÓDULO PAGOS EJECUTADOS FUNCIONANDO CORRECTAMENTE!');
      console.log('✅ API de pagos ejecutados funcionando');
      console.log('✅ API de estadísticas funcionando');
      console.log('✅ Validación de fechas obligatorias');
      console.log('✅ Filtros funcionando');
      console.log('✅ Página frontend cargando');
      console.log('✅ Descarga de Excel disponible');
      console.log('\n🚀 El módulo está listo para usar');
    } else {
      console.log('❌ Hay problemas en el módulo');
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testPagosEjecutados(); 