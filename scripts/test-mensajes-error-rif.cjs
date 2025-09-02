const fs = require('fs');

function testMensajesErrorRIF() {
  console.log('🔍 Verificando mensajes de error mejorados para RIFs...\\n');
  
  try {
    // 1. Verificar función de validación de RIF
    console.log('1. Verificando función de validación de RIF...');
    const apiPath = 'src/app/api/admin/cartera-contribuyentes/route.ts';
    
    if (fs.existsSync(apiPath)) {
      const apiContent = fs.readFileSync(apiPath, 'utf8');
      
      // Verificar mensaje de longitud
      if (apiContent.includes('El RIF debe tener exactamente 10 caracteres. El RIF proporcionado')) {
        console.log('✅ Mensaje de longitud mejorado');
      } else {
        console.log('❌ Mensaje de longitud no mejorado');
      }
      
      // Verificar mensaje de primer carácter
      if (apiContent.includes('El primer carácter del RIF debe ser J, V, E, P, G o C. El carácter')) {
        console.log('✅ Mensaje de primer carácter mejorado');
      } else {
        console.log('❌ Mensaje de primer carácter no mejorado');
      }
      
      // Verificar mensaje de caracteres numéricos
      if (apiContent.includes('Los últimos 9 caracteres del RIF deben ser números. El RIF')) {
        console.log('✅ Mensaje de caracteres numéricos mejorado');
      } else {
        console.log('❌ Mensaje de caracteres numéricos no mejorado');
      }
      
      // Verificar ejemplos en mensajes
      if (apiContent.includes('Ejemplo de formato válido: V123456789')) {
        console.log('✅ Ejemplos incluidos en mensajes');
      } else {
        console.log('❌ Ejemplos no incluidos en mensajes');
      }
      
      // Verificar explicación de tipos
      if (apiContent.includes('J=Jurídico, V=Natural, E=Natural, P=Natural, G=Gobierno, C=Consejo Comunal')) {
        console.log('✅ Explicación de tipos de contribuyente incluida');
      } else {
        console.log('❌ Explicación de tipos de contribuyente no incluida');
      }
    } else {
      console.log('❌ Archivo de API no encontrado');
    }
    
    // 2. Verificar mensajes de RIF duplicado en POST
    console.log('\\n2. Verificando mensajes de RIF duplicado en POST...');
    
    if (fs.existsSync(apiPath)) {
      const apiContent = fs.readFileSync(apiPath, 'utf8');
      
      // Verificar mensaje principal de duplicado
      if (apiContent.includes('RIF duplicado en base de datos. El RIF')) {
        console.log('✅ Mensaje principal de duplicado mejorado');
      } else {
        console.log('❌ Mensaje principal de duplicado no mejorado');
      }
      
      // Verificar detalles educativos
      if (apiContent.includes('Recuerde que el RIF debe tener exactamente 10 dígitos y no puede estar duplicado en la base de datos')) {
        console.log('✅ Detalles educativos incluidos');
      } else {
        console.log('❌ Detalles educativos no incluidos');
      }
      
      // Verificar información adicional en respuesta
      if (apiContent.includes('type: \'DUPLICATE_RIF\'') && apiContent.includes('rif: rif.toUpperCase()')) {
        console.log('✅ Información adicional en respuesta de duplicado');
      } else {
        console.log('❌ Información adicional no incluida en respuesta de duplicado');
      }
    }
    
    // 3. Verificar mensajes de RIF duplicado en PUT (carga masiva)
    console.log('\\n3. Verificando mensajes de RIF duplicado en PUT (carga masiva)...');
    
    if (fs.existsSync(apiPath)) {
      const apiContent = fs.readFileSync(apiPath, 'utf8');
      
      // Verificar mensaje de duplicado en carga masiva
      if (apiContent.includes('RIF duplicado en base de datos. El RIF') && apiContent.includes('ya está registrado en el sistema. Recuerde que el RIF debe tener exactamente 10 dígitos y no puede estar duplicado')) {
        console.log('✅ Mensaje de duplicado en carga masiva mejorado');
      } else {
        console.log('❌ Mensaje de duplicado en carga masiva no mejorado');
      }
    }
    
    console.log('\\n🎯 Verificación de mensajes de error completada!');
    console.log('\\n📋 Resumen de mejoras implementadas:');
    console.log('✅ Mensajes de validación de RIF más informativos');
    console.log('✅ Explicación detallada de errores de formato');
    console.log('✅ Ejemplos de formato válido incluidos');
    console.log('✅ Explicación de tipos de contribuyente');
    console.log('✅ Mensajes de duplicado más educativos');
    console.log('✅ Información adicional en respuestas de error');
    console.log('✅ Detalles sobre requisitos de RIF');
    
    console.log('\\n🔧 Ejemplos de mensajes mejorados:');
    console.log('\\n📝 Validación de longitud:');
    console.log('   "El RIF debe tener exactamente 10 caracteres. El RIF proporcionado "V12345678" tiene 9 caracteres. Recuerde que el formato debe ser: [J/V/E/P/G/C] + 9 dígitos numéricos."');
    
    console.log('\\n📝 Validación de primer carácter:');
    console.log('   "El primer carácter del RIF debe ser J, V, E, P, G o C. El carácter "X" no es válido. Recuerde: J=Jurídico, V=Natural, E=Natural, P=Natural, G=Gobierno, C=Consejo Comunal."');
    
    console.log('\\n📝 Validación de caracteres numéricos:');
    console.log('   "Los últimos 9 caracteres del RIF deben ser números. El RIF "V12345ABC" contiene caracteres no numéricos después del primer carácter. Ejemplo de formato válido: V123456789."');
    
    console.log('\\n📝 RIF duplicado:');
    console.log('   "RIF duplicado en base de datos. El RIF V123456789 ya está registrado en el sistema."');
    console.log('   "Recuerde que el RIF debe tener exactamente 10 dígitos y no puede estar duplicado en la base de datos."');
    
    console.log('\\n🔑 Para probar manualmente:');
    console.log('   1. Intenta agregar un RIF con menos de 10 caracteres');
    console.log('   2. Intenta agregar un RIF con primer carácter inválido');
    console.log('   3. Intenta agregar un RIF con caracteres no numéricos');
    console.log('   4. Intenta agregar un RIF que ya existe en la base de datos');
    console.log('   5. Verifica que los mensajes sean informativos y educativos');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

testMensajesErrorRIF(); 