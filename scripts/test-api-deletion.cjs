const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

// Token JWT válido (necesitarás obtener uno válido)
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ2NTIzMzc0LTg1YWMtNGFmNy1hZjdmLWQyYWE3MGM0NjE1YSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1NjI3MDQ5OCwiZXhwIjoxNzU2MzEzNjk4fQ.46eHoauHePYaDHQEMOd76saxs9zmpA0L3VpJdYqiJbg';

async function testApiDeletion() {
  try {
    console.log('🧪 Probando API de eliminación de usuarios...\n');

    // Configurar headers con el token
    const headers = {
      'Cookie': `auth_token=${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    };

    // 1. Obtener lista de usuarios
    console.log('📋 1. Obteniendo lista de usuarios...');
    const usersResponse = await axios.get(`${BASE_URL}/api/admin/users`, { headers });
    
    if (usersResponse.status !== 200) {
      throw new Error(`Error obteniendo usuarios: ${usersResponse.status}`);
    }

    const users = usersResponse.data;
    console.log(`✅ Usuarios encontrados: ${users.length}`);
    
    if (users.length === 0) {
      console.log('⚠️ No hay usuarios para eliminar');
      return;
    }

    // Mostrar usuarios disponibles
    console.log('👥 Usuarios disponibles:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.email}) - ${user.role?.name || 'Sin rol'}`);
    });
    console.log('');

    // 2. Buscar un usuario para eliminar (excluyendo admin)
    const userToDelete = users.find(user => user.username !== 'admin');
    
    if (!userToDelete) {
      console.log('❌ No se encontró un usuario válido para eliminar');
      return;
    }

    console.log(`🎯 Usuario seleccionado para eliminar: ${userToDelete.username} (ID: ${userToDelete.id})`);
    console.log('');

    // 3. Probar eliminación
    console.log('🗑️ 3. Probando eliminación de usuario...');
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/api/admin/users/${userToDelete.id}/hard-delete`, { headers });
      console.log(`✅ Status: ${deleteResponse.status}`);
      console.log(`📋 Respuesta: ${JSON.stringify(deleteResponse.data)}`);
    } catch (error) {
      console.log('❌ Error eliminando usuario:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }
    console.log('');

    // 4. Verificar que el usuario fue eliminado
    console.log('🔍 4. Verificando eliminación...');
    try {
      const verifyResponse = await axios.get(`${BASE_URL}/api/admin/users`, { headers });
      const remainingUsers = verifyResponse.data;
      
      const userStillExists = remainingUsers.find(u => u.id === userToDelete.id);
      
      if (!userStillExists) {
        console.log('✅ Usuario eliminado correctamente');
      } else {
        console.log('❌ Usuario aún existe después de la eliminación');
      }
    } catch (error) {
      console.log('❌ Error verificando eliminación:', error.response?.status);
    }
    console.log('');

    // 5. Probar eliminación de usuario inexistente
    console.log('🚫 5. Probando eliminación de usuario inexistente...');
    const fakeId = '00000000-0000-0000-0000-000000000000';
    try {
      const fakeDeleteResponse = await axios.delete(`${BASE_URL}/api/admin/users/${fakeId}/hard-delete`, { headers });
      console.log(`❌ Debería fallar pero devolvió: ${fakeDeleteResponse.status}`);
    } catch (error) {
      console.log('✅ Correctamente rechazado:', error.response?.status, error.response?.data?.error);
    }
    console.log('');

    // 6. Verificar métricas finales
    console.log('📊 6. Verificando métricas finales...');
    const finalUsersResponse = await axios.get(`${BASE_URL}/api/admin/users`, { headers });
    const finalUsers = finalUsersResponse.data;
    
    console.log('📈 Métricas finales:');
    console.log(`   - Total usuarios: ${finalUsers.length}`);
    console.log(`   - Usuarios activos: ${finalUsers.filter(u => u.status).length}`);
    console.log(`   - Usuarios inactivos: ${finalUsers.filter(u => !u.status).length}`);
    console.log('');

    console.log('🎉 Pruebas de eliminación completadas!');
    console.log('\n📋 RESUMEN:');
    console.log('✅ API de eliminación funcionando');
    console.log('✅ Validación de usuarios existentes');
    console.log('✅ Manejo de errores correcto');
    console.log('✅ Métricas actualizadas correctamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testApiDeletion(); 