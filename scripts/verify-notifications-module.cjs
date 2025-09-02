const http = require('http');

function testNotificationsModule() {
  console.log('🔍 Verificando estado completo del módulo de notificaciones...\n');

  // 1. Probar API básica
  console.log('1. Probando API básica...');
  testAPI('/api/notifications', 'GET', (status, data) => {
    if (status === 200 && data.success) {
      console.log('✅ API básica funcionando');
      console.log(`   - Total notificaciones: ${data.stats.total}`);
      console.log(`   - Notificaciones activas: ${data.stats.active}`);
      console.log(`   - Datos devueltos: ${data.data.length} notificaciones`);
    } else {
      console.log('❌ Error en API básica:', data.error || 'Status:', status);
    }
  });

  // 2. Probar API con filtros
  console.log('\n2. Probando API con filtros...');
  testAPI('/api/notifications?type=info&limit=3', 'GET', (status, data) => {
    if (status === 200 && data.success) {
      console.log('✅ API con filtros funcionando');
      console.log(`   - Filtro por tipo 'info': ${data.data.length} resultados`);
    } else {
      console.log('❌ Error en API con filtros:', data.error || 'Status:', status);
    }
  });

  // 3. Probar página de notificaciones
  console.log('\n3. Probando página de notificaciones...');
  testAPI('/notificaciones', 'GET', (status, data) => {
    if (status === 200) {
      console.log('✅ Página de notificaciones accesible');
    } else if (status === 307) {
      console.log('✅ Página de notificaciones (redirección por autenticación)');
    } else {
      console.log('❌ Error en página de notificaciones:', status);
    }
  });

  // 4. Probar menú
  console.log('\n4. Verificando menú...');
  testAPI('/api/menus', 'GET', (status, data) => {
    if (status === 200 && data.success) {
      const notificationsMenu = data.data.find(menu => menu.route === '/notificaciones');
      if (notificationsMenu) {
        console.log('✅ Menú de notificaciones configurado');
        console.log(`   - Label: ${notificationsMenu.label}`);
        console.log(`   - Icon: ${notificationsMenu.icon}`);
        console.log(`   - Orden: ${notificationsMenu.orden}`);
      } else {
        console.log('❌ Menú de notificaciones no encontrado');
      }
    } else {
      console.log('❌ Error verificando menú:', data.error || 'Status:', status);
    }
  });
}

function testAPI(path, method, callback) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        callback(res.statusCode, response);
      } catch (error) {
        callback(res.statusCode, { error: 'Invalid JSON response' });
      }
    });
  });

  req.on('error', (error) => {
    callback(0, { error: error.message });
  });

  req.end();
}

// Ejecutar verificación
testNotificationsModule(); 