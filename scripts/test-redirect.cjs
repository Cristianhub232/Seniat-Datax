const puppeteer = require('puppeteer');

async function testRedirect() {
  console.log('🧪 Iniciando prueba de redirección...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('🌐 Navegando a la página principal...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    console.log('⏳ Esperando 6 segundos para que complete el splash screen...');
    await page.waitForTimeout(6000);
    
    // Verificar si estamos en la página de login
    const currentUrl = page.url();
    console.log(`📍 URL actual: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ SUCCESS: Redirección exitosa al login');
    } else {
      console.log('❌ FAIL: No se redirigió al login');
      console.log(`   URL esperada: http://localhost:3000/login`);
      console.log(`   URL actual: ${currentUrl}`);
    }
    
    // Tomar screenshot para verificación
    await page.screenshot({ path: 'redirect-test-result.png' });
    console.log('📸 Screenshot guardado como redirect-test-result.png');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await browser.close();
    console.log('🔌 Navegador cerrado');
  }
}

// Verificar si puppeteer está instalado
try {
  require('puppeteer');
  testRedirect();
} catch (error) {
  console.log('📦 Puppeteer no está instalado. Instalando...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install puppeteer', { stdio: 'inherit' });
    console.log('✅ Puppeteer instalado. Ejecutando prueba...');
    testRedirect();
  } catch (installError) {
    console.error('❌ Error instalando Puppeteer:', installError.message);
    console.log('💡 Para probar manualmente:');
    console.log('   1. Abre http://localhost:3000 en tu navegador');
    console.log('   2. Espera 5 segundos a que termine el splash screen');
    console.log('   3. Verifica que te redirija a /login');
  }
}
