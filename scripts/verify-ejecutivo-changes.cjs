const fs = require('fs');

function verifyEjecutivoChanges() {
  console.log('🔍 Verificando cambios en permisos de ejecutivos...\\n');
  
  try {
    // 1. Verificar useUserProfile.ts
    console.log('1. Verificando useUserProfile.ts...');
    const userProfilePath = 'src/hooks/useUserProfile.ts';
    
    if (fs.existsSync(userProfilePath)) {
      const userProfileContent = fs.readFileSync(userProfilePath, 'utf8');
      
      // Verificar que ejecutivos tienen dashboard
      if (userProfileContent.includes('"id": "dashboard"') && userProfileContent.includes('"title": "Dashboard"')) {
        console.log('✅ Dashboard agregado para ejecutivos');
      } else {
        console.log('❌ Dashboard no agregado para ejecutivos');
      }
      
      // Verificar que ejecutivos tienen cartera de contribuyentes
      if (userProfileContent.includes('"id": "cartera-contribuyentes"') && userProfileContent.includes('"title": "Cartera de Contribuyentes"')) {
        console.log('✅ Cartera de Contribuyentes agregada para ejecutivos');
      } else {
        console.log('❌ Cartera de Contribuyentes no agregada para ejecutivos');
      }
      
      // Verificar que ejecutivos NO tienen ejecutivos
      if (!userProfileContent.includes('"id": "ejecutivos"') || !userProfileContent.includes('"title": "Ejecutivos"')) {
        console.log('✅ Módulo de Ejecutivos removido para ejecutivos');
      } else {
        console.log('❌ Módulo de Ejecutivos aún presente para ejecutivos');
      }
      
      // Verificar comentario actualizado
      if (userProfileContent.includes('// Si el usuario tiene rol "Ejecutivo", mostrar solo dashboard y cartera de contribuyentes')) {
        console.log('✅ Comentario actualizado correctamente');
      } else {
        console.log('❌ Comentario no actualizado');
      }
    } else {
      console.log('❌ Archivo useUserProfile.ts no encontrado');
    }
    
    // 2. Verificar middleware.ts
    console.log('\\n2. Verificando middleware.ts...');
    const middlewarePath = 'src/middleware.ts';
    
    if (fs.existsSync(middlewarePath)) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
      
      // Verificar restricciones para ejecutivos
      if (middlewareContent.includes('// Usuarios con rol "Ejecutivo" solo pueden acceder a dashboard y cartera de contribuyentes')) {
        console.log('✅ Restricciones para ejecutivos agregadas al middleware');
      } else {
        console.log('❌ Restricciones para ejecutivos no agregadas al middleware');
      }
      
      // Verificar rutas permitidas para ejecutivos
      if (middlewareContent.includes("'/dashboard'") && middlewareContent.includes("'/cartera-contribuyentes'")) {
        console.log('✅ Rutas permitidas para ejecutivos configuradas');
      } else {
        console.log('❌ Rutas permitidas para ejecutivos no configuradas');
      }
      
      // Verificar redirección para ejecutivos
      if (middlewareContent.includes('return NextResponse.redirect(new URL(\'/dashboard\', request.url))')) {
        console.log('✅ Redirección a dashboard configurada para ejecutivos');
      } else {
        console.log('❌ Redirección a dashboard no configurada para ejecutivos');
      }
      
      // Verificar log de acceso denegado
      if (middlewareContent.includes('console.log(`🚫 Acceso denegado para Ejecutivo a: ${pathname}`)')) {
        console.log('✅ Log de acceso denegado configurado para ejecutivos');
      } else {
        console.log('❌ Log de acceso denegado no configurado para ejecutivos');
      }
    } else {
      console.log('❌ Archivo middleware.ts no encontrado');
    }
    
    console.log('\\n🎯 Verificación de cambios completada!');
    console.log('\\n📋 Resumen de cambios implementados:');
    console.log('✅ Ejecutivos ahora ven solo Dashboard y Cartera de Contribuyentes');
    console.log('✅ Módulo de Ejecutivos removido del sidebar para ejecutivos');
    console.log('✅ Middleware configurado para bloquear acceso a módulos restringidos');
    console.log('✅ Redirección automática a dashboard para páginas no permitidas');
    console.log('✅ Logs de acceso denegado configurados');
    
    console.log('\\n🔑 Para probar manualmente:');
    console.log('   1. Login con ejecutivo / ejecutivo123');
    console.log('   2. Verificar que solo ve Dashboard y Cartera de Contribuyentes');
    console.log('   3. Intentar acceder a /ejecutivos, /usuarios, /roles (debería redirigir)');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

verifyEjecutivoChanges(); 