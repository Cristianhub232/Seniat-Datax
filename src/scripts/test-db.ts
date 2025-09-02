import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') });

// Verificar que las variables se cargaron
console.log('🔧 Variables de entorno cargadas:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('PETROLERAS_DATABASE_URL:', process.env.PETROLERAS_DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

import sequelize from '../lib/db';
import { User, Role } from '../models/index';

async function testDatabase() {
  try {
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Verificar si la tabla users existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tablas disponibles:', tableExists);

    // Contar usuarios
    const userCount = await User.count();
    console.log(`👥 Total de usuarios en la base de datos: ${userCount}`);

    // Obtener algunos usuarios de ejemplo
    const users = await User.findAll({
      limit: 5,
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });

    console.log('🔍 Usuarios encontrados:');
    users.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Rol: ${user.role?.name || 'Sin rol'}`);
    });

    // Verificar estructura de la tabla
    const tableDescription = await sequelize.getQueryInterface().describeTable('users');
    console.log('📊 Estructura de la tabla users:', Object.keys(tableDescription));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabase(); 