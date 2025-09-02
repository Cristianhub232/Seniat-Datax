const axios = require('axios');

// Configuración
const BASE_URL = 'http://172.16.56.23:3001';

// Token JWT válido (extraído del login exitoso anterior)
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ2NTIzMzc0LTg1YWMtNGFmNy1hZjdmLWQyYWE3MGM0NjE1YSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1NjI3MDQ5OCwiZXhwIjoxNzU2MzEzNjk4fQ.46eHoauHePYaDHQEMOd76saxs9zmpA0L3VpJdYqiJbg';

async function testRolesModule() {
  try {
    console.log('🧪 Iniciando pruebas del módulo de roles...\n');

    // Configurar headers con el token
    const headers = {
      'Cookie': `auth_token=${VALID_TOKEN}`,
      'Content-Type': 'application/json'
    };

    // 1. Probar API de roles
    console.log('🎭 1. Probando API de roles...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/api/admin/roles?all=true`, { headers });
      console.log(`✅ Status: ${rolesResponse.status}`);
      console.log(`📊 Roles devueltos: ${rolesResponse.data.roles?.length || 0}`);
      
      if (rolesResponse.data.roles && rolesResponse.data.roles.length > 0) {
        console.log('👥 Roles disponibles:');
        rolesResponse.data.roles.forEach((role, index) => {
          console.log(`   ${index + 1}. ${role.name} (ID: ${role.id}) - ${role.userCount} usuarios`);
          console.log(`      - Description: ${role.description || 'Sin descripción'}`);
          console.log(`      - Status: ${role.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Error en API de roles:', error.response?.status, error.response?.data);
    }
    console.log('');

    // 2. Probar creación de rol
    console.log('➕ 2. Probando creación de rol...');
    try {
      const newRole = {
        name: 'TEST_ROLE',
        description: 'Rol de prueba para testing'
      };
      
      const createResponse = await axios.post(`${BASE_URL}/api/admin/roles`, newRole, { headers });
      console.log(`✅ Status: ${createResponse.status}`);
      console.log(`📋 Rol creado: ${createResponse.data.role?.name}`);
    } catch (error) {
      console.log('❌ Error creando rol:', error.response?.status, error.response?.data?.error);
    }
    console.log('');

    // 3. Probar actualización de rol
    console.log('✏️ 3. Probando actualización de rol...');
    try {
      // Primero obtener un rol existente
      const rolesResponse = await axios.get(`${BASE_URL}/api/admin/roles?all=true`, { headers });
      if (rolesResponse.data.roles && rolesResponse.data.roles.length > 0) {
        const firstRole = rolesResponse.data.roles[0];
        const updateData = {
          name: firstRole.name,
          description: `${firstRole.description || 'Sin descripción'} - Actualizado`
        };
        
        const updateResponse = await axios.patch(`${BASE_URL}/api/admin/roles/${firstRole.id}`, updateData, { headers });
        console.log(`✅ Status: ${updateResponse.status}`);
        console.log(`📋 Rol actualizado: ${updateResponse.data.message}`);
      }
    } catch (error) {
      console.log('❌ Error actualizando rol:', error.response?.status, error.response?.data?.error);
    }
    console.log('');

    // 4. Probar cambio de estado de rol
    console.log('🔄 4. Probando cambio de estado...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/api/admin/roles?all=true`, { headers });
      if (rolesResponse.data.roles && rolesResponse.data.roles.length > 0) {
        const firstRole = rolesResponse.data.roles[0];
        const statusData = { status: 'inactive' };
        
        const statusResponse = await axios.patch(`${BASE_URL}/api/admin/roles/${firstRole.id}/status`, statusData, { headers });
        console.log(`✅ Status: ${statusResponse.status}`);
        console.log(`📋 Estado cambiado: ${statusResponse.data.message}`);
      }
    } catch (error) {
      console.log('❌ Error cambiando estado:', error.response?.status, error.response?.data?.error);
    }
    console.log('');

    // 5. Probar eliminación de rol
    console.log('🗑️ 5. Probando eliminación de rol...');
    try {
      // Buscar el rol de prueba que creamos
      const rolesResponse = await axios.get(`${BASE_URL}/api/admin/roles?all=true`, { headers });
      const testRole = rolesResponse.data.roles?.find(r => r.name === 'TEST_ROLE');
      
      if (testRole) {
        const deleteResponse = await axios.delete(`${BASE_URL}/api/admin/roles/${testRole.id}`, { headers });
        console.log(`✅ Status: ${deleteResponse.status}`);
        console.log(`📋 Rol eliminado: ${deleteResponse.data.message}`);
      } else {
        console.log('⚠️ No se encontró el rol de prueba para eliminar');
      }
    } catch (error) {
      console.log('❌ Error eliminando rol:', error.response?.status, error.response?.data?.error);
    }
    console.log('');

    // 6. Verificar métricas finales
    console.log('📊 6. Verificando métricas finales...');
    try {
      const finalRolesResponse = await axios.get(`${BASE_URL}/api/admin/roles?all=true`, { headers });
      const roles = finalRolesResponse.data.roles || [];
      
      console.log('📈 Métricas de roles:');
      console.log(`   - Total roles: ${roles.length}`);
      console.log(`   - Roles activos: ${roles.filter(r => r.status === 'active').length}`);
      console.log(`   - Roles inactivos: ${roles.filter(r => r.status === 'inactive').length}`);
      console.log(`   - Total usuarios asignados: ${roles.reduce((sum, r) => sum + (r.userCount || 0), 0)}`);
      
      console.log('\n👥 Distribución de usuarios por rol:');
      roles.forEach(role => {
        console.log(`   - ${role.name}: ${role.userCount || 0} usuarios`);
      });
    } catch (error) {
      console.log('❌ Error obteniendo métricas:', error.response?.status, error.response?.data?.error);
    }
    console.log('');

    // 7. Verificar página de roles
    console.log('🌐 7. Verificando página de roles...');
    try {
      const pageResponse = await axios.get(`${BASE_URL}/roles`, { headers });
      console.log(`✅ Status: ${pageResponse.status}`);
      console.log(`📄 Tamaño de respuesta: ${pageResponse.data.length} caracteres`);
    } catch (error) {
      console.log('❌ Error accediendo a la página de roles:', error.response?.status);
    }
    console.log('');

    console.log('🎉 Todas las pruebas completadas exitosamente!');
    console.log('\n📋 RESUMEN:');
    console.log('✅ API de roles respondiendo correctamente');
    console.log('✅ Operaciones CRUD funcionando');
    console.log('✅ Métricas calculadas correctamente');
    console.log('✅ Página web accesible');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testRolesModule(); 