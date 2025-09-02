const { Sequelize } = require('sequelize');

// Configuración de la base de datos local
const xmlsConfig = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

// Crear conexión
const xmlsDB = new Sequelize(xmlsConfig);

async function dropAppSchema() {
  try {
    console.log('🗑️  Eliminando esquema app y todas sus tablas...');
    
    // Eliminar el esquema completo (esto eliminará todas las tablas)
    await xmlsDB.query('DROP SCHEMA IF EXISTS app CASCADE;');
    console.log('✅ Esquema app eliminado completamente');
    
  } catch (error) {
    console.error('❌ Error eliminando esquema app:', error.message);
    throw error;
  }
}

async function verifyDeletion() {
  try {
    console.log('🔍 Verificando eliminación...');
    
    // Verificar que el esquema ya no existe
    const [schemas] = await xmlsDB.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'app';
    `);
    
    if (schemas.length === 0) {
      console.log('✅ Esquema app eliminado correctamente');
    } else {
      console.log('❌ El esquema app aún existe');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Eliminando esquema app completamente...');
    console.log('🎯 Base de datos: xmls (localhost)');
    console.log('🎯 Esquema: app');
    console.log('');
    
    // Eliminar esquema
    await dropAppSchema();
    
    // Verificar eliminación
    await verifyDeletion();
    
    console.log('');
    console.log('🎉 ¡Esquema app eliminado exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. Crear nuevo esquema app con estructura limpia');
    console.log('2. Configurar modelos de autenticación');
    console.log('3. Implementar lógica de login completa');
    console.log('4. Probar el sistema de autenticación');
    
  } catch (error) {
    console.error('💥 Error durante la eliminación:', error);
    process.exit(1);
  } finally {
    await xmlsDB.close();
  }
}

// Ejecutar eliminación
main(); 