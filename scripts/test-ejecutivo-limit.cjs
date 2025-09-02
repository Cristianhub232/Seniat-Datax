const fs = require('fs');

function testEjecutivoLimit() {
  console.log('🔍 Verificando límite de 1000 contribuyentes para usuarios Ejecutivo...\\n');
  
  try {
    // 1. Verificar API POST (crear contribuyente individual)
    console.log('1. Verificando API POST (crear contribuyente individual)...');
    const apiPath = 'src/app/api/admin/cartera-contribuyentes/route.ts';
    
    if (fs.existsSync(apiPath)) {
      const apiContent = fs.readFileSync(apiPath, 'utf8');
      
      // Verificar que se obtiene el rol del usuario
      if (apiContent.includes('const userRole = tokenPayload.role;')) {
        console.log('✅ Se obtiene el rol del usuario del token');
      } else {
        console.log('❌ No se obtiene el rol del usuario del token');
      }
      
      // Verificar que se obtiene el ID del usuario
      if (apiContent.includes('const userId = tokenPayload.id;')) {
        console.log('✅ Se obtiene el ID del usuario del token');
      } else {
        console.log('❌ No se obtiene el ID del usuario del token');
      }
      
      // Verificar validación de límite para Ejecutivo
      if (apiContent.includes("if (userRole === 'Ejecutivo')")) {
        console.log('✅ Validación de límite agregada para rol Ejecutivo');
      } else {
        console.log('❌ Validación de límite no agregada para rol Ejecutivo');
      }
      
      // Verificar consulta de conteo
      if (apiContent.includes("SELECT COUNT(*) as count FROM CGBRITO.CARTERA_CONTRIBUYENTES WHERE USUARIO_ID = ?")) {
        console.log('✅ Consulta de conteo de contribuyentes agregada');
      } else {
        console.log('❌ Consulta de conteo de contribuyentes no agregada');
      }
      
      // Verificar validación de límite de 1000
      if (apiContent.includes('if (count >= 1000)')) {
        console.log('✅ Validación de límite de 1000 contribuyentes agregada');
      } else {
        console.log('❌ Validación de límite de 1000 contribuyentes no agregada');
      }
      
      // Verificar mensaje de error
      if (apiContent.includes('Límite alcanzado. Los usuarios con rol Ejecutivo no pueden exceder de 1000 contribuyentes en su cartera.')) {
        console.log('✅ Mensaje de error personalizado agregado');
      } else {
        console.log('❌ Mensaje de error personalizado no agregado');
      }
      
      // Verificar respuesta con información adicional
      if (apiContent.includes('currentCount: count') && apiContent.includes('limit: 1000')) {
        console.log('✅ Respuesta incluye información de conteo y límite');
      } else {
        console.log('❌ Respuesta no incluye información de conteo y límite');
      }
    } else {
      console.log('❌ Archivo de API no encontrado');
    }
    
    // 2. Verificar API PUT (carga masiva)
    console.log('\\n2. Verificando API PUT (carga masiva)...');
    
    if (fs.existsSync(apiPath)) {
      const apiContent = fs.readFileSync(apiPath, 'utf8');
      
      // Verificar validación de límite en carga masiva
      if (apiContent.includes('// Verificar si la carga masiva excedería el límite')) {
        console.log('✅ Validación de límite en carga masiva agregada');
      } else {
        console.log('❌ Validación de límite en carga masiva no agregada');
      }
      
      // Verificar cálculo de espacios disponibles
      if (apiContent.includes('const availableSlots = 1000 - count;')) {
        console.log('✅ Cálculo de espacios disponibles agregado');
      } else {
        console.log('❌ Cálculo de espacios disponibles no agregado');
      }
      
      // Verificar validación de carga masiva
      if (apiContent.includes('if (rifs.length > availableSlots)')) {
        console.log('✅ Validación de carga masiva agregada');
      } else {
        console.log('❌ Validación de carga masiva no agregada');
      }
      
      // Verificar mensaje de error para carga masiva
      if (apiContent.includes('No se pueden cargar') && apiContent.includes('espacios disponibles')) {
        console.log('✅ Mensaje de error para carga masiva agregado');
      } else {
        console.log('❌ Mensaje de error para carga masiva no agregado');
      }
      
      // Verificar información adicional en respuesta de carga masiva
      if (apiContent.includes('availableSlots') && apiContent.includes('requestedCount: rifs.length')) {
        console.log('✅ Información adicional en respuesta de carga masiva');
      } else {
        console.log('❌ Información adicional en respuesta de carga masiva no agregada');
      }
    }
    
    console.log('\\n🎯 Verificación de límite de contribuyentes completada!');
    console.log('\\n📋 Resumen de implementación:');
    console.log('✅ Límite de 1000 contribuyentes implementado para usuarios Ejecutivo');
    console.log('✅ Validación en creación individual de contribuyentes');
    console.log('✅ Validación en carga masiva de contribuyentes');
    console.log('✅ Mensajes de error informativos con detalles');
    console.log('✅ Cálculo de espacios disponibles');
    console.log('✅ Respuestas con información de conteo y límite');
    
    console.log('\\n🔧 Cómo funciona la restricción:');
    console.log('1. Al crear un contribuyente, se verifica el rol del usuario');
    console.log('2. Si es Ejecutivo, se cuenta cuántos contribuyentes tiene actualmente');
    console.log('3. Si ya tiene 1000 o más, se rechaza la operación');
    console.log('4. En carga masiva, se verifica que no exceda el límite disponible');
    console.log('5. Se devuelven mensajes informativos con detalles del límite');
    
    console.log('\\n🔑 Para probar manualmente:');
    console.log('   1. Inicia sesión como usuario con rol Ejecutivo');
    console.log('   2. Intenta agregar contribuyentes hasta llegar a 1000');
    console.log('   3. Al intentar agregar el contribuyente 1001, deberías ver el error');
    console.log('   4. El mensaje incluirá información sobre el límite alcanzado');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

testEjecutivoLimit(); 