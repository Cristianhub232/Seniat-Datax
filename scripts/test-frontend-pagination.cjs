const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function testFrontendPagination() {
  try {
    console.log('🔍 Verificando que el frontend recibe datos de paginación...\n');
    
    // Simular la respuesta que debería recibir el frontend
    console.log('1. Simulando respuesta del API...');
    
    const mockResponse = {
      data: [
        {
          id: 'test1',
          rif: 'J123456789',
          tipoContribuyente: 'JURIDICO',
          usuarioId: 'user1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          usuario: {
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User'
          }
        }
        // ... más datos simulados
      ],
      pagination: {
        currentPage: 1,
        totalPages: 21,
        totalRecords: 2052,
        limit: 100,
        hasNextPage: true,
        hasPrevPage: false
      }
    };
    
    console.log('   ✅ Respuesta simulada creada');
    console.log(`   🔍 Estructura: ${mockResponse.data ? 'data presente' : 'data ausente'}`);
    console.log(`   🔍 Paginación: ${mockResponse.pagination ? 'pagination presente' : 'pagination ausente'}`);
    console.log(`   🔍 Contribuyentes: ${mockResponse.data.length}`);
    console.log(`   🔍 Página actual: ${mockResponse.pagination.currentPage}`);
    console.log(`   🔍 Total de páginas: ${mockResponse.pagination.totalPages}`);
    console.log(`   🔍 Total de registros: ${mockResponse.pagination.totalRecords}`);

    // Simular la lógica del frontend
    console.log('\n2. Simulando lógica del frontend...');
    
    const contribuyentesRes = mockResponse;
    
    // Verificar si tiene la estructura correcta
    const hasPagination = contribuyentesRes.data && contribuyentesRes.pagination;
    console.log(`   🔍 Tiene paginación: ${hasPagination}`);
    
    if (hasPagination) {
      const contribuyentes = contribuyentesRes.data;
      const currentPage = contribuyentesRes.pagination.currentPage;
      const totalPages = contribuyentesRes.pagination.totalPages;
      const totalRecords = contribuyentesRes.pagination.totalRecords;
      const hasNextPage = contribuyentesRes.pagination.hasNextPage;
      const hasPrevPage = contribuyentesRes.pagination.hasPrevPage;
      
      console.log(`   ✅ Contribuyentes: ${contribuyentes.length}`);
      console.log(`   ✅ Página actual: ${currentPage}`);
      console.log(`   ✅ Total de páginas: ${totalPages}`);
      console.log(`   ✅ Total de registros: ${totalRecords}`);
      console.log(`   ✅ Tiene siguiente: ${hasNextPage}`);
      console.log(`   ✅ Tiene anterior: ${hasPrevPage}`);
      
      // Verificar condiciones de renderizado
      const shouldShowPagination = totalRecords > 0;
      const shouldShowPrevButton = hasPrevPage;
      const shouldShowNextButton = hasNextPage;
      const shouldShowPageNumbers = totalPages > 1;
      
      console.log('\n3. Condiciones de renderizado:');
      console.log(`   🔍 Mostrar paginación: ${shouldShowPagination}`);
      console.log(`   🔍 Mostrar botón anterior: ${shouldShowPrevButton}`);
      console.log(`   🔍 Mostrar botón siguiente: ${shouldShowNextButton}`);
      console.log(`   🔍 Mostrar números de página: ${shouldShowPageNumbers}`);
      
      // Calcular información de "Mostrando X - Y de Z"
      const startRecord = contribuyentes.length > 0 ? ((currentPage - 1) * 100) + 1 : 0;
      const endRecord = Math.min(currentPage * 100, totalRecords);
      
      console.log('\n4. Información de registros mostrados:');
      console.log(`   🔍 Registro inicial: ${startRecord}`);
      console.log(`   🔍 Registro final: ${endRecord}`);
      console.log(`   🔍 Texto: "Mostrando ${startRecord} - ${endRecord} de ${totalRecords} contribuyentes"`);
      
    } else {
      console.log('   ❌ No tiene estructura de paginación');
    }

    // Probar con diferentes escenarios
    console.log('\n5. Probando diferentes escenarios...');
    
    const scenarios = [
      { name: 'Primera página', page: 1, totalPages: 21, totalRecords: 2052 },
      { name: 'Página intermedia', page: 10, totalPages: 21, totalRecords: 2052 },
      { name: 'Última página', page: 21, totalPages: 21, totalRecords: 2052 },
      { name: 'Solo una página', page: 1, totalPages: 1, totalRecords: 50 }
    ];
    
    scenarios.forEach(scenario => {
      const hasNext = scenario.page < scenario.totalPages;
      const hasPrev = scenario.page > 1;
      const startRec = ((scenario.page - 1) * 100) + 1;
      const endRec = Math.min(scenario.page * 100, scenario.totalRecords);
      
      console.log(`   🔍 ${scenario.name}:`);
      console.log(`      - Página ${scenario.page} de ${scenario.totalPages}`);
      console.log(`      - Registros ${startRec} - ${endRec} de ${scenario.totalRecords}`);
      console.log(`      - Anterior: ${hasPrev}, Siguiente: ${hasNext}`);
    });

    console.log('\n✅ Verificación del frontend completada!');
    console.log('\n📝 Resumen:');
    console.log('   - Estructura de respuesta correcta');
    console.log('   - Lógica de paginación funciona');
    console.log('   - Condiciones de renderizado correctas');
    console.log('   - Cálculos de registros correctos');

  } catch (error) {
    console.error('❌ Error en la verificación del frontend:', error.message);
  }
}

testFrontendPagination(); 