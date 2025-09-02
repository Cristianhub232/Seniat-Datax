require('dotenv').config({ path: '.env.local' });

const { Sequelize } = require('sequelize');

// Verificar variables de entorno
console.log('🔧 Variables de entorno:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function testDatabase() {
  try {
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Verificar si la tabla users existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas disponibles:', tableExists);

    // Contar usuarios directamente con SQL
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    const userCount = results[0].count;
    console.log(`👥 Total de usuarios en la base de datos: ${userCount}`);

    // Obtener algunos usuarios de ejemplo
    const [users] = await sequelize.query(`
      SELECT u.id, u.username, u.email, u.status, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      LIMIT 5
    `);

    console.log('🔍 Usuarios encontrados:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Rol: ${user.role_name || 'Sin rol'} - Status: ${user.status}`);
    });

    // Verificar estructura de la tabla
    const tableDescription = await sequelize.getQueryInterface().describeTable('users');
    console.log('📊 Columnas de la tabla users:', Object.keys(tableDescription));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testDatabase(); 