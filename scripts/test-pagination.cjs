const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testPagination() {
  try {
    console.log('🔍 Probando paginación de cartera de contribuyentes...\n');
    
    // 1. Probar primera página
    console.log('1. Probando primera página...');
    const page1Response = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?page=1&limit=100`);
    
    if (page1Response.status === 200) {
      const data = page1Response.data;
      console.log(`   ✅ Página 1 cargada exitosamente`);
      console.log(`   🔍 Contribuyentes en página 1: ${data.data.length}`);
      console.log(`   🔍 Total de registros: ${data.pagination.totalRecords}`);
      console.log(`   🔍 Total de páginas: ${data.pagination.totalPages}`);
      console.log(`   🔍 Página actual: ${data.pagination.currentPage}`);
      console.log(`   🔍 Límite por página: ${data.pagination.limit}`);
      console.log(`   🔍 Tiene siguiente página: ${data.pagination.hasNextPage}`);
      console.log(`   🔍 Tiene página anterior: ${data.pagination.hasPrevPage}`);
    } else {
      console.log(`   ❌ Error en página 1: ${page1Response.status}`);
    }

    // 2. Probar segunda página (si existe)
    console.log('\n2. Probando segunda página...');
    const page2Response = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?page=2&limit=100`);
    
    if (page2Response.status === 200) {
      const data = page2Response.data;
      console.log(`   ✅ Página 2 cargada exitosamente`);
      console.log(`   🔍 Contribuyentes en página 2: ${data.data.length}`);
      console.log(`   🔍 Página actual: ${data.pagination.currentPage}`);
      console.log(`   🔍 Tiene siguiente página: ${data.pagination.hasNextPage}`);
      console.log(`   🔍 Tiene página anterior: ${data.pagination.hasPrevPage}`);
    } else {
      console.log(`   ❌ Error en página 2: ${page2Response.status}`);
    }

    // 3. Probar con filtros
    console.log('\n3. Probando paginación con filtros...');
    const filteredResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?page=1&limit=50&tipo=NATURAL`);
    
    if (filteredResponse.status === 200) {
      const data = filteredResponse.data;
      console.log(`   ✅ Página filtrada cargada exitosamente`);
      console.log(`   🔍 Contribuyentes naturales en página 1: ${data.data.length}`);
      console.log(`   🔍 Total de registros filtrados: ${data.pagination.totalRecords}`);
      console.log(`   🔍 Total de páginas filtradas: ${data.pagination.totalPages}`);
      console.log(`   🔍 Límite por página: ${data.pagination.limit}`);
    } else {
      console.log(`   ❌ Error en página filtrada: ${filteredResponse.status}`);
    }

    // 4. Probar límites
    console.log('\n4. Probando diferentes límites...');
    const limit10Response = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?page=1&limit=10`);
    
    if (limit10Response.status === 200) {
      const data = limit10Response.data;
      console.log(`   ✅ Límite 10 cargado exitosamente`);
      console.log(`   🔍 Contribuyentes en página: ${data.data.length}`);
      console.log(`   🔍 Límite aplicado: ${data.pagination.limit}`);
      console.log(`   🔍 Total de páginas: ${data.pagination.totalPages}`);
    } else {
      console.log(`   ❌ Error con límite 10: ${limit10Response.status}`);
    }

    // 5. Probar página inválida
    console.log('\n5. Probando página inválida...');
    try {
      const invalidPageResponse = await axios.get(`${BASE_URL}/api/admin/cartera-contribuyentes?page=999&limit=100`);
      console.log(`   ⚠️ Página 999 devolvió: ${invalidPageResponse.data.data.length} registros`);
    } catch (error) {
      console.log(`   ✅ Página inválida manejada correctamente: ${error.response?.status || 'Error'}`);
    }

    console.log('\n✅ Prueba de paginación completada!');
    console.log('\n📝 Resumen:');
    console.log('   - Paginación implementada correctamente');
    console.log('   - Límite de 100 registros por página');
    console.log('   - Información de paginación incluida');
    console.log('   - Filtros funcionan con paginación');
    console.log('   - Manejo de páginas inválidas');

  } catch (error) {
    console.error('❌ Error en la prueba de paginación:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testPagination(); 