const fs = require('fs');
const pdfParse = require('pdf-parse');

async function analyzePDF() {
  try {
    console.log('📄 Analizando PDF de obligaciones tributarias...');
    
    // Leer el archivo PDF
    const dataBuffer = fs.readFileSync('/home/k8s/app/public/GO-43031-18122024-Calendario-SPE-2025-extracto.pdf');
    
    // Extraer texto del PDF
    const data = await pdfParse(dataBuffer);
    
    console.log('📋 Contenido extraído del PDF:');
    console.log('=' .repeat(80));
    console.log(data.text);
    console.log('=' .repeat(80));
    
    // Guardar el texto extraído en un archivo para análisis posterior
    fs.writeFileSync('pdf-content.txt', data.text);
    console.log('💾 Contenido guardado en pdf-content.txt');
    
    // Analizar el contenido para identificar patrones de obligaciones
    const lines = data.text.split('\n').filter(line => line.trim());
    
    console.log('\n🔍 Analizando patrones de obligaciones...');
    
    const obligaciones = [];
    let currentObligacion = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Buscar patrones de fechas (formato DD/MM/YYYY)
      const fechaMatch = line.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (fechaMatch) {
        if (currentObligacion.fecha) {
          obligaciones.push({...currentObligacion});
        }
        currentObligacion = {
          fecha: `${fechaMatch[3]}-${fechaMatch[2].padStart(2, '0')}-${fechaMatch[1].padStart(2, '0')}`,
          descripcion: line,
          tipo: 'Pendiente de clasificación'
        };
      }
      
      // Buscar patrones de tipos de impuestos
      if (line.includes('IVA') || line.includes('ISLR') || line.includes('IMPUESTO')) {
        if (currentObligacion.fecha) {
          currentObligacion.tipo = line;
        }
      }
      
      // Buscar patrones de descripción de obligaciones
      if (line.includes('DECLARACIÓN') || line.includes('PAGO') || line.includes('RETENCIÓN')) {
        if (currentObligacion.fecha) {
          currentObligacion.descripcion = line;
        }
      }
    }
    
    // Agregar la última obligación si existe
    if (currentObligacion.fecha) {
      obligaciones.push(currentObligacion);
    }
    
    console.log('\n📊 Obligaciones identificadas:');
    obligaciones.forEach((obligacion, index) => {
      console.log(`${index + 1}. Fecha: ${obligacion.fecha}`);
      console.log(`   Tipo: ${obligacion.tipo}`);
      console.log(`   Descripción: ${obligacion.descripcion}`);
      console.log('');
    });
    
    // Guardar las obligaciones en formato JSON
    fs.writeFileSync('obligaciones-extraidas.json', JSON.stringify(obligaciones, null, 2));
    console.log('💾 Obligaciones guardadas en obligaciones-extraidas.json');
    
    return obligaciones;
    
  } catch (error) {
    console.error('❌ Error analizando PDF:', error);
    return [];
  }
}

analyzePDF(); 