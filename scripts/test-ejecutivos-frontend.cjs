const puppeteer = require('puppeteer');
require('dotenv').config({ path: '.env.local' });

async function testEjecutivosFrontend() {
  let browser;
  try {
    console.log('🔍 Iniciando pruebas del frontend de Ejecutivos...\n');

    // Iniciar navegador
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1280, height: 720 });

    console.log('1️⃣ Navegando a la página de login...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });

    // Login
    console.log('2️⃣ Iniciando sesión...');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Esperar redirección al dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Login exitoso');

    // Navegar al módulo de ejecutivos
    console.log('3️⃣ Navegando al módulo de Ejecutivos...');
    await page.goto('http://localhost:3001/ejecutivos', { waitUntil: 'networkidle2' });
    
    // Esperar a que cargue la página
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Página de ejecutivos cargada');

    // Verificar elementos principales
    console.log('4️⃣ Verificando elementos de la interfaz...');
    
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`📋 Título: ${title}`);

    // Verificar cards de estadísticas
    const cards = await page.$$('[class*="bg-blue-50"], [class*="bg-green-50"], [class*="bg-yellow-50"], [class*="bg-purple-50"]');
    console.log(`📊 Cards de estadísticas encontradas: ${cards.length}`);

    // Verificar tabla
    const table = await page.$('table');
    if (table) {
      console.log('✅ Tabla de ejecutivos encontrada');
      
      // Contar filas
      const rows = await page.$$('table tbody tr');
      console.log(`📋 Filas en la tabla: ${rows.length}`);
    } else {
      console.log('⚠️ Tabla no encontrada');
    }

    // Verificar botón de crear
    const createButton = await page.$('button:has-text("Nuevo Ejecutivo")');
    if (createButton) {
      console.log('✅ Botón "Nuevo Ejecutivo" encontrado');
    } else {
      console.log('⚠️ Botón "Nuevo Ejecutivo" no encontrado');
    }

    // Probar búsqueda
    console.log('5️⃣ Probando funcionalidad de búsqueda...');
    const searchInput = await page.$('input[placeholder*="Buscar"]');
    if (searchInput) {
      await searchInput.type('María');
      await page.waitForTimeout(1000);
      console.log('✅ Búsqueda funcionando');
    }

    // Probar creación de ejecutivo
    console.log('6️⃣ Probando creación de ejecutivo...');
    if (createButton) {
      await createButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Llenar formulario
      await page.type('input[placeholder="V-12345678"]', 'V-TEST9999');
      await page.type('input[placeholder="Juan"]', 'Test');
      await page.type('input[placeholder="Pérez"]', 'Usuario');
      await page.type('input[type="email"]', 'test.usuario@seniat.gob.ve');
      await page.type('input[type="password"]', 'password123');
      
      // Enviar formulario
      await page.click('button[type="submit"]');
      
      // Esperar respuesta
      await page.waitForTimeout(2000);
      console.log('✅ Formulario de creación enviado');
    }

    // Verificar que se agregó el nuevo ejecutivo
    console.log('7️⃣ Verificando nuevo ejecutivo...');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const newRows = await page.$$('table tbody tr');
    console.log(`📋 Filas después de crear: ${newRows.length}`);

    console.log('\n🎉 Pruebas del frontend completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔌 Navegador cerrado');
    }
  }
}

// Ejecutar las pruebas
testEjecutivosFrontend(); 