const puppeteer = require('puppeteer');

async function testPaginationBrowser() {
  let browser;
  
  try {
    console.log('🔍 Probando paginación en el navegador...\n');
    
    // Iniciar navegador
    browser = await puppeteer.launch({ 
      headless: false, // Mostrar navegador para ver qué pasa
      slowMo: 1000 // Ralentizar para ver mejor
    });
    
    const page = await browser.newPage();
    
    // Ir a la página de cartera de contribuyentes
    console.log('1. Navegando a la página...');
    await page.goto('http://localhost:3001/cartera-contribuyentes', { 
      waitUntil: 'networkidle2' 
    });
    
    // Esperar a que cargue la página
    await page.waitForSelector('table', { timeout: 10000 });
    
    console.log('   ✅ Página cargada exitosamente');
    
    // Verificar si hay controles de paginación
    console.log('\n2. Verificando controles de paginación...');
    const paginationExists = await page.$('.flex.items-center.justify-between.px-6.py-4.border-t.border-gray-200.bg-gray-50');
    
    if (paginationExists) {
      console.log('   ✅ Controles de paginación encontrados');
      
      // Obtener información de paginación
      const paginationText = await page.$eval('.text-sm.text-gray-600', el => el.textContent);
      console.log(`   🔍 Texto de paginación: "${paginationText}"`);
      
      // Verificar botones de navegación
      const prevButton = await page.$('button:has-text("Anterior")');
      const nextButton = await page.$('button:has-text("Siguiente")');
      
      console.log(`   🔍 Botón Anterior: ${prevButton ? 'Encontrado' : 'No encontrado'}`);
      console.log(`   🔍 Botón Siguiente: ${nextButton ? 'Encontrado' : 'No encontrado'}`);
      
      // Verificar números de página
      const pageButtons = await page.$$('button[class*="w-8 h-8 p-0"]');
      console.log(`   🔍 Números de página: ${pageButtons.length} botones encontrados`);
      
      // Obtener información de la tabla
      const tableRows = await page.$$('tbody tr');
      console.log(`   🔍 Filas en la tabla: ${tableRows.length}`);
      
      // Probar navegación si hay más de una página
      if (pageButtons.length > 1) {
        console.log('\n3. Probando navegación...');
        
        // Hacer clic en la segunda página
        const secondPageButton = pageButtons[1];
        if (secondPageButton) {
          console.log('   🔍 Haciendo clic en página 2...');
          await secondPageButton.click();
          
          // Esperar a que cargue
          await page.waitForTimeout(2000);
          
          // Verificar que cambió la página
          const newPaginationText = await page.$eval('.text-sm.text-gray-600', el => el.textContent);
          console.log(`   🔍 Nuevo texto de paginación: "${newPaginationText}"`);
          
          const newTableRows = await page.$$('tbody tr');
          console.log(`   🔍 Nuevas filas en la tabla: ${newTableRows.length}`);
        }
      }
      
    } else {
      console.log('   ❌ Controles de paginación NO encontrados');
      
      // Verificar si hay datos en la tabla
      const tableRows = await page.$$('tbody tr');
      console.log(`   🔍 Filas en la tabla: ${tableRows.length}`);
      
      // Verificar si hay mensaje de "no hay datos"
      const noDataMessage = await page.$('td[colspan="6"]');
      if (noDataMessage) {
        const message = await noDataMessage.evaluate(el => el.textContent);
        console.log(`   🔍 Mensaje: "${message}"`);
      }
    }
    
    // Verificar información de estadísticas
    console.log('\n4. Verificando información de estadísticas...');
    const statsText = await page.$eval('.mb-4.text-sm.text-gray-600', el => el.textContent);
    console.log(`   🔍 Información de estadísticas: "${statsText}"`);
    
    // Tomar screenshot
    console.log('\n5. Tomando screenshot...');
    await page.screenshot({ 
      path: 'pagination-test.png', 
      fullPage: true 
    });
    console.log('   ✅ Screenshot guardado como "pagination-test.png"');
    
    console.log('\n✅ Prueba de paginación en navegador completada!');
    
  } catch (error) {
    console.error('❌ Error en la prueba del navegador:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testPaginationBrowser(); 