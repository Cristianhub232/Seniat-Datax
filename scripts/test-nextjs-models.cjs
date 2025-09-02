require('dotenv').config({ path: '.env.local' });

// Simular el entorno de Next.js
process.env.NODE_ENV = 'development';

// Importar los modelos
try {
  console.log('🔍 Probando importación de modelos...');
  
  // Intentar importar los modelos
  const { User, Role } = require('../src/models/index.ts');
  
  console.log('✅ Modelos importados correctamente');
  console.log('👤 User model:', typeof User);
  console.log('🎭 Role model:', typeof Role);
  
  // Verificar que los modelos tienen las propiedades esperadas
  console.log('📋 User tableName:', User.tableName);
  console.log('📋 Role tableName:', Role.tableName);
  console.log('📋 User schema:', User.options?.schema);
  console.log('📋 Role schema:', Role.options?.schema);
  
} catch (error) {
  console.error('❌ Error importando modelos:', error.message);
  console.error('Stack:', error.stack);
}

// Probar la configuración de la base de datos
try {
  console.log('\n🔍 Probando configuración de base de datos...');
  
  const { authSequelize } = require('../src/lib/db.ts');
  
  console.log('✅ Conexión de autenticación importada');
  console.log('🔗 authSequelize:', typeof authSequelize);
  
} catch (error) {
  console.error('❌ Error importando configuración de DB:', error.message);
  console.error('Stack:', error.stack);
}

// Probar el controlador
try {
  console.log('\n🔍 Probando controlador de autenticación...');
  
  const { loginUser } = require('../src/controllers/authController.ts');
  
  console.log('✅ Controlador importado correctamente');
  console.log('🔧 loginUser function:', typeof loginUser);
  
} catch (error) {
  console.error('❌ Error importando controlador:', error.message);
  console.error('Stack:', error.stack);
} 