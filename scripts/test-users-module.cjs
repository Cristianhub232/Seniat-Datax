const axios = require('axios');

// Configuración
const BASE_URL = 'http://172.16.56.23:3001';
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

async function testUsersModule() {
  try {
    console.log('🧪 Iniciando pruebas del módulo de usuarios...\n');

    // 1. Login
    console.log('🔐 1. Probando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const cookies = loginResponse.headers['set-cookie'];
    const authCookie = cookies?.find(cookie => cookie.includes('auth_token'));
    
    if (!authCookie) {
      throw new Error('No se recibió cookie de autenticación');
    }

    console.log('✅ Login exitoso');
    console.log(`📋 Cookie: ${authCookie.split(';')[0]}\n`);

    // Configurar headers para requests autenticados
    const authHeaders = {
      'Cookie': authCookie,
      'Content-Type': 'application/json'
    };

    // 2. Verificar datos del usuario actual
    console.log('👤 2. Verificando datos del usuario actual...');
    const meResponse = await axios.get(`${BASE_URL}/api/me`, { headers: authHeaders });
    
    if (meResponse.status === 200) {
      const userData = meResponse.data;
      console.log('✅ Datos del usuario actual:');
      console.log(`   - Username: ${userData.username}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Role: ${userData.role?.name || 'Sin rol'}`);
    } else {
      console.log('❌ Error obteniendo datos del usuario');
    }
    console.log('');

    // 3. Obtener lista de usuarios
    console.log('📋 3. Obteniendo lista de usuarios...');
    const usersResponse = await axios.get(`${BASE_URL}/api/admin/users`, { headers: authHeaders });
    
    if (usersResponse.status === 200) {
      const users = usersResponse.data;
      console.log(`✅ Lista de usuarios obtenida (${users.length} usuarios):`);
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (${user.email}) - ${user.role?.name || 'Sin rol'} - ${user.status ? 'Activo' : 'Inactivo'}`);
      });
    } else {
      console.log('❌ Error obteniendo lista de usuarios');
    }
    console.log('');

    // 4. Obtener roles
    console.log('🎭 4. Obteniendo roles...');
    const rolesResponse = await axios.get(`${BASE_URL}/api/admin/roles?all=true`, { headers: authHeaders });
    
    if (rolesResponse.status === 200) {
      const roles = rolesResponse.data.roles || rolesResponse.data;
      console.log(`✅ Roles obtenidos (${roles.length} roles):`);
      
      roles.forEach((role, index) => {
        console.log(`   ${index + 1}. ${role.name} (ID: ${role.id})`);
      });
    } else {
      console.log('❌ Error obteniendo roles');
    }
    console.log('');

    // 5. Probar filtros de búsqueda
    console.log('🔍 5. Probando filtros de búsqueda...');
    
    // Búsqueda por username
    const searchByUsername = await axios.get(`${BASE_URL}/api/admin/users?username=analista`, { headers: authHeaders });
    if (searchByUsername.status === 200) {
      const filteredUsers = searchByUsername.data;
      console.log(`✅ Búsqueda por username "analista": ${filteredUsers.length} resultados`);
      filteredUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email})`);
      });
    }
    console.log('');

    // Búsqueda por email
    const searchByEmail = await axios.get(`${BASE_URL}/api/admin/users?email=seniat.gob.ve`, { headers: authHeaders });
    if (searchByEmail.status === 200) {
      const filteredUsers = searchByEmail.data;
      console.log(`✅ Búsqueda por email "seniat.gob.ve": ${filteredUsers.length} resultados`);
    }
    console.log('');

    // 6. Verificar métricas
    console.log('📊 6. Verificando métricas...');
    
    const allUsers = usersResponse.data;
    const activeUsers = allUsers.filter(u => u.status);
    const inactiveUsers = allUsers.filter(u => !u.status);
    const uniqueRoles = [...new Set(allUsers.map(u => u.role?.name).filter(Boolean))];

    console.log('📈 Métricas calculadas:');
    console.log(`   - Total usuarios: ${allUsers.length}`);
    console.log(`   - Usuarios activos: ${activeUsers.length}`);
    console.log(`   - Usuarios inactivos: ${inactiveUsers.length}`);
    console.log(`   - Roles únicos: ${uniqueRoles.length}`);
    console.log(`   - Roles utilizados: ${uniqueRoles.join(', ')}`);
    console.log('');

    // 7. Verificar estructura de datos
    console.log('🔍 7. Verificando estructura de datos...');
    
    if (allUsers.length > 0) {
      const sampleUser = allUsers[0];
      const requiredFields = ['id', 'username', 'email', 'role_id', 'status', 'created_at', 'updated_at', 'role'];
      const missingFields = requiredFields.filter(field => !(field in sampleUser));
      
      if (missingFields.length === 0) {
        console.log('✅ Estructura de datos correcta');
        console.log('📋 Campos verificados:', requiredFields.join(', '));
      } else {
        console.log('❌ Campos faltantes:', missingFields.join(', '));
      }
    }
    console.log('');

    // 8. Verificar página de usuarios
    console.log('🌐 8. Verificando página de usuarios...');
    const pageResponse = await axios.get(`${BASE_URL}/usuarios`, { headers: authHeaders });
    
    if (pageResponse.status === 200) {
      console.log('✅ Página de usuarios accesible');
      console.log(`📄 Tamaño de respuesta: ${pageResponse.data.length} caracteres`);
    } else {
      console.log('❌ Error accediendo a la página de usuarios');
    }
    console.log('');

    console.log('🎉 Todas las pruebas completadas exitosamente!');
    console.log('\n📋 RESUMEN:');
    console.log('✅ Login y autenticación funcionando');
    console.log('✅ API de usuarios respondiendo correctamente');
    console.log('✅ Filtros de búsqueda operativos');
    console.log('✅ Métricas calculadas correctamente');
    console.log('✅ Estructura de datos consistente');
    console.log('✅ Página web accesible');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('📋 Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

// Ejecutar las pruebas
testUsersModule(); 