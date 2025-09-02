const puppeteer = require('puppeteer');

async function testCheckboxes() {
  let browser;
  
  try {
    console.log('🔍 Iniciando prueba de checkboxes...');
    
    // Iniciar navegador
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Ir a la página de cartera de contribuyentes
    console.log('📄 Navegando a la página...');
    await page.goto('http://172.16.56.23:3001/cartera-contribuyentes', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Esperar a que la página cargue completamente
    await page.waitForTimeout(5000);
    
    // Verificar si hay contribuyentes en la tabla
    console.log('🔍 Verificando contribuyentes en la tabla...');
    const contribuyentesCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      return rows.length;
    });
    
    console.log(`📊 Encontrados ${contribuyentesCount} contribuyentes en la tabla`);
    
    if (contribuyentesCount > 0) {
      // Verificar si hay checkboxes
      console.log('🔍 Verificando checkboxes...');
      const checkboxesCount = await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        return checkboxes.length;
      });
      
      console.log(`✅ Encontrados ${checkboxesCount} checkboxes`);
      
      // Verificar si hay botón de eliminación masiva
      console.log('🔍 Verificando botón de eliminación masiva...');
      const bulkDeleteButton = await page.evaluate(() => {
        const button = document.querySelector('button:contains("Eliminar Seleccionados")');
        return button ? button.textContent : null;
      });
      
      if (bulkDeleteButton) {
        console.log('✅ Botón de eliminación masiva encontrado');
      } else {
        console.log('❌ Botón de eliminación masiva NO encontrado');
      }
      
      // Intentar hacer clic en un checkbox
      console.log('🔍 Intentando hacer clic en un checkbox...');
      const checkboxClicked = await page.evaluate(() => {
        const firstCheckbox = document.querySelector('tbody tr:first-child input[type="checkbox"]');
        if (firstCheckbox) {
          firstCheckbox.click();
          return true;
        }
        return false;
      });
      
      if (checkboxClicked) {
        console.log('✅ Checkbox clickeado exitosamente');
        
        // Esperar un momento para que se actualice el estado
        await page.waitForTimeout(1000);
        
        // Verificar si el botón de eliminación masiva aparece
        const buttonVisible = await page.evaluate(() => {
          const button = document.querySelector('button:contains("Eliminar Seleccionados")');
          return button && !button.disabled;
        });
        
        if (buttonVisible) {
          console.log('✅ Botón de eliminación masiva está habilitado después de seleccionar');
        } else {
          console.log('❌ Botón de eliminación masiva NO está habilitado');
        }
      } else {
        console.log('❌ No se pudo hacer clic en el checkbox');
      }
      
    } else {
      console.log('⚠️ No hay contribuyentes para probar');
    }
    
    // Tomar una captura de pantalla
    console.log('📸 Tomando captura de pantalla...');
    await page.screenshot({ 
      path: 'test-checkboxes-screenshot.png',
      fullPage: true 
    });
    
    console.log('✅ Prueba completada. Captura guardada como test-checkboxes-screenshot.png');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testCheckboxes(); 