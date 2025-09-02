import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') });

import sequelize from '../lib/db.js';

import '../models/Role.js';
import '../models/Menu.js';
import '../models/RoleMenuPermission.js';
import '../models/User.js'; // al final para que tome las relaciones

(async () => {
  try {
    console.log('📦 Modelos registrados:', Object.keys(sequelize.models));

    await sequelize.sync({ force: true });
    console.log('✅ Tabla sincronizada correctamente');
  } catch (e) {
    console.error('❌ Error al sincronizar:', e);
  } finally {
    await sequelize.close();
  }
})();
