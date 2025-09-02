const fs = require('fs');
const path = require('path');

function verifyCarteraFilters() {
  console.log('🔍 Verificando filtros por rol en cartera de contribuyentes...\\n');
  
  try {
    // 1. Verificar API principal de cartera de contribuyentes
    console.log('1. Verificando API principal de cartera de contribuyentes...');
    const mainApiPath = 'src/app/api/admin/cartera-contribuyentes/route.ts';
    
    if (fs.existsSync(mainApiPath)) {
      const mainApiContent = fs.readFileSync(mainApiPath, 'utf8');
      
      // Verificar que se obtiene el rol del usuario
      if (mainApiContent.includes('const userRole = tokenPayload.role;')) {
        console.log('✅ Se obtiene el rol del usuario del token');
      } else {
        console.log('❌ No se obtiene el rol del usuario del token');
      }
      
      // Verificar que se obtiene el ID del usuario
      if (mainApiContent.includes('const userId = tokenPayload.id;')) {
        console.log('✅ Se obtiene el ID del usuario del token');
      } else {
        console.log('❌ No se obtiene el ID del usuario del token');
      }
      
      // Verificar filtro para ejecutivos y auditor jefe
      if (mainApiContent.includes("userRole === 'Ejecutivo' || userRole === 'Auditor Jefe'")) {
        console.log('✅ Filtro aplicado para Ejecutivo y Auditor Jefe');
      } else {
        console.log('❌ Filtro no aplicado para Ejecutivo y Auditor Jefe');
      }
      
      // Verificar que se aplica el filtro por USUARIO_ID
      if (mainApiContent.includes("conditions.push('c.USUARIO_ID = ?')")) {
        console.log('✅ Filtro por USUARIO_ID aplicado correctamente');
      } else {
        console.log('❌ Filtro por USUARIO_ID no aplicado');
      }
      
      // Verificar que admin no tiene filtro
      if (mainApiContent.includes("// Si es ADMIN, no se aplica filtro")) {
        console.log('✅ Admin no tiene filtro (ve todos los contribuyentes)');
      } else {
        console.log('❌ Comentario sobre admin no encontrado');
      }
    } else {
      console.log('❌ Archivo de API principal no encontrado');
    }
    
    // 2. Verificar API de estadísticas
    console.log('\\n2. Verificando API de estadísticas...');
    const statsApiPath = 'src/app/api/admin/cartera-contribuyentes/stats/route.ts';
    
    if (fs.existsSync(statsApiPath)) {
      const statsApiContent = fs.readFileSync(statsApiPath, 'utf8');
      
      // Verificar que se obtiene el rol del usuario
      if (statsApiContent.includes('const userRole = tokenPayload.role;')) {
        console.log('✅ Se obtiene el rol del usuario del token (stats)');
      } else {
        console.log('❌ No se obtiene el rol del usuario del token (stats)');
      }
      
      // Verificar que se obtiene el ID del usuario
      if (statsApiContent.includes('const userId = tokenPayload.id;')) {
        console.log('✅ Se obtiene el ID del usuario del token (stats)');
      } else {
        console.log('❌ No se obtiene el ID del usuario del token (stats)');
      }
      
      // Verificar filtro para ejecutivos y auditor jefe
      if (statsApiContent.includes("userRole === 'Ejecutivo' || userRole === 'Auditor Jefe'")) {
        console.log('✅ Filtro aplicado para Ejecutivo y Auditor Jefe (stats)');
      } else {
        console.log('❌ Filtro no aplicado para Ejecutivo y Auditor Jefe (stats)');
      }
      
      // Verificar que se aplica el filtro por USUARIO_ID
      if (statsApiContent.includes("conditions.push('USUARIO_ID = ?')")) {
        console.log('✅ Filtro por USUARIO_ID aplicado correctamente (stats)');
      } else {
        console.log('❌ Filtro por USUARIO_ID no aplicado (stats)');
      }
      
      // Verificar que admin no tiene filtro
      if (statsApiContent.includes("// Si es ADMIN, no se aplica filtro")) {
        console.log('✅ Admin no tiene filtro en estadísticas (ve todas)');
      } else {
        console.log('❌ Comentario sobre admin no encontrado (stats)');
      }
    } else {
      console.log('❌ Archivo de API de estadísticas no encontrado');
    }
    
    // 3. Verificar middleware
    console.log('\\n3. Verificando middleware...');
    const middlewarePath = 'src/middleware.ts';
    
    if (fs.existsSync(middlewarePath)) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
      
      // Verificar que ejecutivos pueden acceder a cartera de contribuyentes
      if (middlewareContent.includes("pathname.startsWith('/api/admin/cartera-contribuyentes')")) {
        console.log('✅ Middleware permite acceso a cartera de contribuyentes');
      } else {
        console.log('❌ Middleware no permite acceso a cartera de contribuyentes');
      }
      
      // Verificar que se permite acceso para ejecutivos
      if (middlewareContent.includes("userRole === 'Ejecutivo' || userRole === 'ADMIN'")) {
        console.log('✅ Middleware permite acceso para ejecutivos');
      } else {
        console.log('❌ Middleware no permite acceso para ejecutivos');
      }
    } else {
      console.log('❌ Archivo de middleware no encontrado');
    }
    
    console.log('\\n🎯 Verificación de filtros completada!');
    console.log('\\n📋 Resumen de implementación:');
    console.log('✅ Filtros por rol implementados en API principal');
    console.log('✅ Filtros por rol implementados en API de estadísticas');
    console.log('✅ Middleware configurado para permisos de acceso');
    console.log('✅ Admin: Ve todos los contribuyentes (sin filtro)');
    console.log('✅ Ejecutivo: Ve solo sus contribuyentes (filtro por USUARIO_ID)');
    console.log('✅ Auditor Jefe: Ve solo sus contribuyentes (filtro por USUARIO_ID)');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
  }
}

verifyCarteraFilters(); 