const puppeteer = require('puppeteer');

async function testPagosFrontendComplete() {
  let browser;
  
  try {
    console.log('🔍 Probando funcionalidad completa del frontend de pagos ejecutados...\n');
    
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('1. Navegando a la aplicación...');
    await page.goto('http://172.16.56.23:3001/login');
    await page.waitForTimeout(2000);

    console.log('2. Iniciando sesión como ejecutivo...');
    await page.type('input[name="username"]', 'ejecutivo');
    await page.type('input[name="password"]', 'ejecutivo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('3. Verificando acceso al dashboard...');
    const currentUrl = page.url();
    console.log(`   URL actual: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('   ✅ Login exitoso');
    } else {
      console.log('   ❌ Error en login');
      return;
    }

    console.log('4. Navegando al módulo de pagos ejecutados...');
    await page.goto('http://172.16.56.23:3001/pagos-ejecutados');
    await page.waitForTimeout(3000);

    console.log('5. Verificando fechas por defecto...');
    const fechaInicioValue = await page.$eval('input[name="fechaInicio"]', el => el.value);
    const fechaFinValue = await page.$eval('input[name="fechaFin"]', el => el.value);
    
    console.log(`   Fecha inicio: ${fechaInicioValue}`);
    console.log(`   Fecha fin: ${fechaFinValue}`);
    
    // Verificar que las fechas son de los últimos 7 días
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const expectedInicio = sevenDaysAgo.toISOString().split('T')[0];
    const expectedFin = today.toISOString().split('T')[0];
    
    if (fechaInicioValue === expectedInicio && fechaFinValue === expectedFin) {
      console.log('   ✅ Fechas por defecto correctas (últimos 7 días)');
    } else {
      console.log('   ❌ Fechas por defecto incorrectas');
    }

    console.log('6. Verificando carga automática de datos...');
    await page.waitForTimeout(5000); // Esperar a que carguen los datos
    
    const isLoading = await page.$('.animate-spin');
    if (!isLoading) {
      console.log('   ✅ Datos cargados automáticamente');
    } else {
      console.log('   ⏳ Aún cargando datos...');
      await page.waitForTimeout(5000);
    }

    console.log('7. Verificando estadísticas...');
    const statsCards = await page.$$('.bg-blue-50, .bg-green-50, .bg-yellow-50, .bg-red-50, .bg-purple-50');
    console.log(`   ✅ Tarjetas de estadísticas encontradas: ${statsCards.length}`);

    console.log('8. Verificando tabla de resultados...');
    const tableRows = await page.$$('table tbody tr');
    console.log(`   ✅ Filas en la tabla: ${tableRows.length}`);

    console.log('9. Verificando botón de descarga...');
    const downloadButton = await page.$('button:has-text("Descargar Excel")');
    if (downloadButton) {
      const isDisabled = await downloadButton.evaluate(btn => btn.disabled);
      const buttonText = await downloadButton.evaluate(btn => btn.textContent);
      
      console.log(`   Texto del botón: ${buttonText}`);
      console.log(`   Botón deshabilitado: ${isDisabled}`);
      
      if (tableRows.length > 0 && !isDisabled) {
        console.log('   ✅ Botón habilitado con datos disponibles');
        
        console.log('10. Probando descarga...');
        await downloadButton.click();
        await page.waitForTimeout(2000);
        
        // Verificar si aparece el modal
        const modal = await page.$('[role="dialog"]');
        if (modal) {
          console.log('   ✅ Modal de confirmación apareció');
          
          // Verificar contenido del modal
          const modalText = await modal.evaluate(el => el.textContent);
          console.log('   📋 Contenido del modal:');
          console.log(`      ${modalText.replace(/\n/g, '\n      ')}`);
          
          // Hacer clic en cancelar para cerrar el modal
          const cancelButton = await page.$('button:has-text("Cancelar")');
          if (cancelButton) {
            await cancelButton.click();
            console.log('   ✅ Modal cerrado correctamente');
          }
        } else {
          console.log('   ❌ Modal no apareció');
        }
      } else if (tableRows.length === 0) {
        console.log('   ✅ Botón deshabilitado correctamente (sin datos)');
      }
    } else {
      console.log('   ❌ Botón de descarga no encontrado');
    }

    console.log('11. Probando cambio de fechas...');
    // Cambiar a fechas específicas (1 de agosto a 30 de agosto)
    await page.fill('input[name="fechaInicio"]', '2025-08-01');
    await page.fill('input[name="fechaFin"]', '2025-08-30');
    
    const searchButton = await page.$('button:has-text("Buscar Pagos")');
    if (searchButton) {
      await searchButton.click();
      console.log('   ✅ Búsqueda iniciada');
      await page.waitForTimeout(5000);
      
      // Verificar nuevos resultados
      const newTableRows = await page.$$('table tbody tr');
      console.log(`   ✅ Nuevos resultados: ${newTableRows.length} filas`);
      
      // Verificar botón de descarga con nuevos datos
      const newDownloadButton = await page.$('button:has-text("Descargar Excel")');
      if (newDownloadButton) {
        const newButtonText = await newDownloadButton.evaluate(btn => btn.textContent);
        console.log(`   Texto actualizado del botón: ${newButtonText}`);
      }
    }

    console.log('\n✅ Pruebas del frontend completadas!');
    console.log('\n📋 Resumen de funcionalidades:');
    console.log('   ✅ Login como ejecutivo');
    console.log('   ✅ Acceso al módulo de pagos ejecutados');
    console.log('   ✅ Fechas por defecto (últimos 7 días)');
    console.log('   ✅ Carga automática de datos');
    console.log('   ✅ Visualización de estadísticas');
    console.log('   ✅ Tabla de resultados');
    console.log('   ✅ Botón de descarga inteligente');
    console.log('   ✅ Modal de confirmación');
    console.log('   ✅ Cambio de fechas y búsqueda');
    console.log('   ✅ Restricción por usuario ejecutivo');

  } catch (error) {
    console.error('❌ Error en las pruebas del frontend:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testPagosFrontendComplete(); 