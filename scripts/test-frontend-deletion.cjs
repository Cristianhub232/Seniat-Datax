const puppeteer = require('puppeteer');

async function testFrontendDeletion() {
  let browser;
  try {
    console.log('🧪 Probando eliminación de usuarios desde el frontend...\n');

    // Iniciar navegador
    browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Configurar viewport
    await page.setViewport({ width: 1280, height: 720 });

    // 1. Navegar a la página de login
    console.log('🌐 1. Navegando a la página de login...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle0' });
    console.log('✅ Página de login cargada');

    // 2. Hacer login
    console.log('🔐 2. Iniciando sesión...');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login completado');

    // 3. Navegar a la página de usuarios
    console.log('👥 3. Navegando a la página de usuarios...');
    await page.goto('http://localhost:3001/usuarios', { waitUntil: 'networkidle0' });
    console.log('✅ Página de usuarios cargada');

    // 4. Esperar a que se carguen los usuarios
    console.log('⏳ 4. Esperando a que se carguen los usuarios...');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    console.log('✅ Usuarios cargados');

    // 5. Contar usuarios antes de eliminar
    const usersBefore = await page.$$eval('table tbody tr', rows => rows.length);
    console.log(`📊 Usuarios antes de eliminar: ${usersBefore}`);

    // 6. Buscar un usuario para eliminar (excluyendo admin)
    console.log('🔍 5. Buscando usuario para eliminar...');
    const userToDelete = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      for (let row of rows) {
        const username = row.querySelector('td:first-child')?.textContent?.trim();
        if (username && username !== 'admin') {
          return username;
        }
      }
      return null;
    });

    if (!userToDelete) {
      console.log('❌ No se encontró un usuario válido para eliminar');
      return;
    }

    console.log(`🎯 Usuario seleccionado para eliminar: ${userToDelete}`);

    // 7. Hacer clic en el botón de acciones del usuario
    console.log('🖱️ 6. Haciendo clic en el botón de acciones...');
    await page.evaluate((username) => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      for (let row of rows) {
        const rowUsername = row.querySelector('td:first-child')?.textContent?.trim();
        if (rowUsername === username) {
          const actionsButton = row.querySelector('button');
          if (actionsButton) {
            actionsButton.click();
            return;
          }
        }
      }
    }, userToDelete);

    // 8. Esperar a que aparezca el menú desplegable y hacer clic en "Eliminar"
    console.log('🗑️ 7. Haciendo clic en "Eliminar"...');
    await page.waitForSelector('[role="menuitem"]', { timeout: 5000 });
    await page.click('[role="menuitem"]:last-child');

    // 9. Esperar a que aparezca el modal de confirmación
    console.log('⚠️ 8. Esperando modal de confirmación...');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Modal de confirmación apareció');

    // 10. Hacer clic en "Eliminar" en el modal
    console.log('✅ 9. Confirmando eliminación...');
    await page.click('button[type="button"]:last-child');

    // 11. Esperar a que se complete la eliminación
    console.log('⏳ 10. Esperando a que se complete la eliminación...');
    await page.waitForTimeout(2000);

    // 12. Verificar que el usuario fue eliminado
    console.log('🔍 11. Verificando eliminación...');
    const usersAfter = await page.$$eval('table tbody tr', rows => rows.length);
    console.log(`📊 Usuarios después de eliminar: ${usersAfter}`);

    if (usersAfter < usersBefore) {
      console.log('✅ Usuario eliminado correctamente desde el frontend');
    } else {
      console.log('❌ Usuario no fue eliminado desde el frontend');
    }

    // 13. Verificar que el usuario específico ya no existe
    const userStillExists = await page.evaluate((username) => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.some(row => {
        const rowUsername = row.querySelector('td:first-child')?.textContent?.trim();
        return rowUsername === username;
      });
    }, userToDelete);

    if (!userStillExists) {
      console.log('✅ Usuario específico eliminado correctamente');
    } else {
      console.log('❌ Usuario específico aún existe');
    }

    console.log('\n🎉 Prueba de eliminación desde frontend completada!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Navegador cerrado');
    }
  }
}

// Verificar si puppeteer está instalado
try {
  require('puppeteer');
  testFrontendDeletion();
} catch (error) {
  console.log('❌ Puppeteer no está instalado. Instalando...');
  console.log('Ejecuta: npm install puppeteer');
} 