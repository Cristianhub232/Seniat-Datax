const http = require('http');

function testPage(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testFooter() {
  try {
    console.log('🔍 Probando footer en diferentes páginas...\n');
    
    const pages = ['/', '/usuarios', '/not-dashboard'];
    
    for (const page of pages) {
      console.log(`📄 Probando: ${page}`);
      const result = await testPage(page);
      
      if (result.status === 200) {
        const hasONT = result.data.includes('ONT - Oficina Nacional del Tesoro');
        const hasSENIAT = result.data.includes('SENIAT');
        const hasDerechosReservados = result.data.includes('Todos los Derechos Reservados');
        
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   🏛️  ONT encontrado: ${hasONT ? '✅' : '❌'}`);
        console.log(`   🚫 SENIAT encontrado: ${hasSENIAT ? '❌' : '✅'}`);
        console.log(`   📜 Derechos Reservados: ${hasDerechosReservados ? '✅' : '❌'}`);
        
        if (hasSENIAT) {
          console.log(`   ⚠️  PROBLEMA: Se encontró SENIAT en ${page}`);
        }
      } else {
        console.log(`   ❌ Status: ${result.status}`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFooter(); 