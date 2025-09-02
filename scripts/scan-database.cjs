const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const dbConfig = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

async function scanDatabase() {
  const sequelize = new Sequelize(dbConfig);
  
  try {
    console.log('🔍 Escaneando estructura de la base de datos xmls...\n');
    
    // 1. Listar todos los esquemas
    console.log('📋 ESQUEMAS DISPONIBLES:');
    const [schemas] = await sequelize.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name;
    `);
    
    schemas.forEach(schema => {
      console.log(`   - ${schema.schema_name}`);
    });
    
    console.log('');
    
    // 2. Para cada esquema, listar sus tablas
    for (const schema of schemas) {
      const schemaName = schema.schema_name;
      console.log(`📊 TABLAS EN ESQUEMA "${schemaName}":`);
      
      const [tables] = await sequelize.query(`
        SELECT table_name, table_type
        FROM information_schema.tables 
        WHERE table_schema = ? 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `, {
        replacements: [schemaName]
      });
      
      if (tables.length === 0) {
        console.log('   (Sin tablas)');
      } else {
        tables.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      }
      
      console.log('');
    }
    
    // 3. Verificar tablas específicas en esquema app
    console.log('🔐 VERIFICACIÓN ESQUEMA APP (Autenticación):');
    const appTables = ['users', 'roles', 'menus', 'role_menu_permissions'];
    
    for (const table of appTables) {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'app' AND table_name = ?
      `, {
        replacements: [table]
      });
      
      if (result[0].count > 0) {
        const [data] = await sequelize.query(`SELECT COUNT(*) as count FROM app.${table}`);
        console.log(`   ✅ ${table}: ${data[0].count} registros`);
      } else {
        console.log(`   ❌ ${table}: No existe`);
      }
    }
    
    console.log('');
    
    // 4. Verificar tablas específicas en esquema public
    console.log('📊 VERIFICACIÓN ESQUEMA PUBLIC (Datos de negocio):');
    const publicTables = ['bancos', 'codigos_presupuestarios', 'formas', 'empresas_petroleras', 'planillas_recaudacion_2024'];
    
    for (const table of publicTables) {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = ?
      `, {
        replacements: [table]
      });
      
      if (result[0].count > 0) {
        const [data] = await sequelize.query(`SELECT COUNT(*) as count FROM public.${table}`);
        console.log(`   ✅ ${table}: ${data[0].count} registros`);
      } else {
        console.log(`   ❌ ${table}: No existe`);
      }
    }
    
    console.log('');
    
    // 5. Verificar esquema datalake
    console.log('🌊 VERIFICACIÓN ESQUEMA DATALAKE (Vistas materializadas):');
    const datalakeTables = ['formas_no_validadas_mv', 'planillas_sin_conceptos_mv', 'reportes_cierre_mv'];
    
    for (const table of datalakeTables) {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'datalake' AND table_name = ?
      `, {
        replacements: [table]
      });
      
      if (result[0].count > 0) {
        const [data] = await sequelize.query(`SELECT COUNT(*) as count FROM datalake.${table}`);
        console.log(`   ✅ ${table}: ${data[0].count} registros`);
      } else {
        console.log(`   ❌ ${table}: No existe`);
      }
    }
    
    console.log('\n🎯 RESUMEN DE LA LÓGICA:');
    console.log('   🔐 app.* - Usuarios, roles, menús, permisos (Autenticación)');
    console.log('   📊 public.* - Datos de negocio (Bancos, códigos, formas, etc.)');
    console.log('   🌊 datalake.* - Vistas materializadas (Reportes y consultas)');
    
  } catch (error) {
    console.error('❌ Error escaneando base de datos:', error.message);
  } finally {
    await sequelize.close();
  }
}

scanDatabase(); 