import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Conexión a la base de datos XMLS
const xmlsDatabaseUrl = process.env.XMLS_DATABASE_URL;
if (!xmlsDatabaseUrl) {
  console.error('❌ XMLS_DATABASE_URL no está configurada');
  process.exit(1);
}

const sequelize = new Sequelize(xmlsDatabaseUrl, {
  dialect: 'postgres',
  logging: false,
});

async function createMaterializedView() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('📋 Ejecutando script de creación de vista materializada...');
    
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create-materialized-view.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log('⚡ Ejecutando comandos SQL...');
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await sequelize.query(command + ';');
          console.log('✅ Comando ejecutado:', command.substring(0, 50) + '...');
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('⚠️  Vista ya existe, continuando...');
          } else {
            console.log('⚠️  Error en comando:', error.message);
          }
        }
      }
    }

    console.log('🎉 Vista materializada creada exitosamente!');
    
    // Verificar que la vista se creó correctamente
    console.log('🔍 Verificando la vista materializada...');
    const [views] = await sequelize.query(`
      SELECT matviewname, schemaname 
      FROM pg_matviews 
      WHERE matviewname = 'planillas_recaudacion_2024_mv'
    `);
    
    if (views.length > 0) {
      console.log('✅ Vista materializada encontrada:', views[0]);
      
      // Obtener estadísticas básicas
      const [stats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_registros,
          COUNT(DISTINCT rif_contribuyente) as contribuyentes_unicos,
          COUNT(DISTINCT nombre_banco) as bancos_unicos,
          SUM(monto_total_trans) as monto_total,
          AVG(monto_total_trans) as monto_promedio
        FROM datalake.planillas_recaudacion_2024_mv
      `);
      
      if (stats.length > 0) {
        console.log('📊 Estadísticas de la vista materializada:');
        console.log('   - Total registros:', stats[0].total_registros);
        console.log('   - Contribuyentes únicos:', stats[0].contribuyentes_unicos);
        console.log('   - Bancos únicos:', stats[0].bancos_unicos);
        console.log('   - Monto total:', new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats[0].monto_total));
        console.log('   - Monto promedio:', new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats[0].monto_promedio));
      }
    } else {
      console.log('❌ No se encontró la vista materializada.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
}

// Ejecutar el script
createMaterializedView(); 