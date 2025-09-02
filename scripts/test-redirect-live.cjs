const { exec } = require('child_process');

console.log('🧪 Test de Redirección en Tiempo Real');
console.log('=====================================');
console.log('');
console.log('📍 URL de la aplicación: http://localhost:3001');
console.log('📍 URL del login: http://localhost:3001/login');
console.log('');
console.log('📋 Pasos para probar:');
console.log('   1. Abre http://localhost:3001 en tu navegador');
console.log('   2. Deberías ver el splash screen con el logo SENIAT');
console.log('   3. Espera 5 segundos completos');
console.log('   4. Deberías ser redirigido automáticamente a /login');
console.log('');
console.log('🔍 Verificaciones:');
console.log('   ✅ Splash screen se muestra correctamente');
console.log('   ✅ Animaciones funcionan (logo, texto, partículas)');
console.log('   ✅ Después de 5 segundos, redirección a /login');
console.log('   ✅ Página de login se carga correctamente');
console.log('');

// Verificar que ambas URLs estén funcionando
console.log('🔌 Verificando conectividad...');

const testUrls = [
  { url: 'http://localhost:3001', name: 'Página Principal' },
  { url: 'http://localhost:3001/login', name: 'Página de Login' }
];

testUrls.forEach(({ url, name }) => {
  exec(`curl -s -o /dev/null -w "%{http_code}" ${url}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
      return;
    }
    
    const status = stdout.trim();
    if (status === '200') {
      console.log(`✅ ${name}: OK (${status})`);
    } else {
      console.log(`❌ ${name}: Error (${status})`);
    }
  });
});

console.log('');
console.log('💡 Si hay problemas:');
console.log('   - Verifica que Next.js esté corriendo en puerto 3001');
console.log('   - Revisa la consola del navegador para errores');
console.log('   - Verifica que no haya conflictos de puertos');
console.log('');
console.log('🚀 ¡Listo para probar! Abre http://localhost:3001 en tu navegador');
