const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Configuración de las bases de datos
const cienciaContriConfig = {
  username: "cristian",
  password: "cristian",
  database: "ciencia_contri",
  host: "10.242.162.161",
  dialect: "postgres"
};

const xmlsConfig = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

// Crear conexiones
const cienciaContriDB = new Sequelize(cienciaContriConfig);
const xmlsDB = new Sequelize(xmlsConfig);

async function createAppSchema() {
  try {
    console.log('🔧 Creando esquema app en base de datos xmls...');
    await xmlsDB.query('CREATE SCHEMA IF NOT EXISTS app;');
    console.log('✅ Esquema app creado exitosamente');
  } catch (error) {
    console.error('❌ Error creando esquema app:', error.message);
    throw error;
  }
}

async function migrateTable(sourceDB, targetDB, tableName, sourceSchema = 'public', targetSchema = 'app') {
  try {
    console.log(`📦 Migrando tabla ${tableName}...`);
    
    // Obtener estructura de la tabla
    const [columns] = await sourceDB.query(`
      SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = '${sourceSchema}' 
      AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `);
    
    // Crear tabla en destino
    let createTableSQL = `CREATE TABLE IF NOT EXISTS ${targetSchema}.${tableName} (`;
    const columnDefinitions = columns.map(col => {
      let definition = `${col.column_name} ${col.data_type}`;
      
      if (col.character_maximum_length) {
        definition += `(${col.character_maximum_length})`;
      }
      
      if (col.is_nullable === 'NO') {
        definition += ' NOT NULL';
      }
      
      if (col.column_default) {
        definition += ` DEFAULT ${col.column_default}`;
      }
      
      return definition;
    });
    
    createTableSQL += columnDefinitions.join(', ') + ');';
    
    await targetDB.query(createTableSQL);
    console.log(`✅ Tabla ${tableName} creada en esquema ${targetSchema}`);
    
    // Migrar datos
    const [data] = await sourceDB.query(`SELECT * FROM ${sourceSchema}.${tableName};`);
    
    if (data.length > 0) {
      const insertSQL = `INSERT INTO ${targetSchema}.${tableName} SELECT * FROM ${sourceSchema}.${tableName};`;
      await targetDB.query(insertSQL);
      console.log(`✅ ${data.length} registros migrados a ${tableName}`);
    } else {
      console.log(`ℹ️  No hay datos para migrar en ${tableName}`);
    }
    
  } catch (error) {
    console.error(`❌ Error migrando tabla ${tableName}:`, error.message);
    throw error;
  }
}

async function migrateSequences() {
  try {
    console.log('🔄 Migrando secuencias...');
    
    // Obtener secuencias de la base de datos origen
    const [sequences] = await cienciaContriDB.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public';
    `);
    
    for (const seq of sequences) {
      const sequenceName = seq.sequence_name;
      console.log(`📊 Migrando secuencia ${sequenceName}...`);
      
      // Obtener valor actual de la secuencia
      const [currentValue] = await cienciaContriDB.query(`SELECT last_value FROM ${sequenceName};`);
      
      // Crear secuencia en destino
      await xmlsDB.query(`CREATE SEQUENCE IF NOT EXISTS app.${sequenceName};`);
      
      // Establecer valor actual
      if (currentValue[0].last_value > 0) {
        await xmlsDB.query(`SELECT setval('app.${sequenceName}', ${currentValue[0].last_value});`);
      }
      
      console.log(`✅ Secuencia ${sequenceName} migrada`);
    }
    
  } catch (error) {
    console.error('❌ Error migrando secuencias:', error.message);
    throw error;
  }
}

async function createIndexes() {
  try {
    console.log('🔍 Creando índices...');
    
    // Índices para users
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_users_username ON app.users(username);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_users_email ON app.users(email);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_users_role_id ON app.users(role_id);');
    
    // Índices para roles
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_roles_name ON app.roles(name);');
    
    // Índices para menus
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_key ON app.menus(key);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_parent_id ON app.menus(parent_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_menus_section ON app.menus(section);');
    
    // Índices para role_menu_permissions
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_role_menu_permissions_role_id ON app.role_menu_permissions(role_id);');
    await xmlsDB.query('CREATE INDEX IF NOT EXISTS idx_app_role_menu_permissions_menu_id ON app.role_menu_permissions(menu_id);');
    
    console.log('✅ Índices creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando índices:', error.message);
    throw error;
  }
}

async function createForeignKeys() {
  try {
    console.log('🔗 Creando claves foráneas...');
    
    // FK: users.role_id -> roles.id
    await xmlsDB.query(`
      ALTER TABLE app.users 
      ADD CONSTRAINT fk_users_role_id 
      FOREIGN KEY (role_id) REFERENCES app.roles(id) ON DELETE CASCADE;
    `);
    
    // FK: menus.parent_id -> menus.id
    await xmlsDB.query(`
      ALTER TABLE app.menus 
      ADD CONSTRAINT fk_menus_parent_id 
      FOREIGN KEY (parent_id) REFERENCES app.menus(id) ON DELETE CASCADE;
    `);
    
    // FK: role_menu_permissions.role_id -> roles.id
    await xmlsDB.query(`
      ALTER TABLE app.role_menu_permissions 
      ADD CONSTRAINT fk_role_menu_permissions_role_id 
      FOREIGN KEY (role_id) REFERENCES app.roles(id) ON DELETE CASCADE;
    `);
    
    // FK: role_menu_permissions.menu_id -> menus.id
    await xmlsDB.query(`
      ALTER TABLE app.role_menu_permissions 
      ADD CONSTRAINT fk_role_menu_permissions_menu_id 
      FOREIGN KEY (menu_id) REFERENCES app.menus(id) ON DELETE CASCADE;
    `);
    
    console.log('✅ Claves foráneas creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando claves foráneas:', error.message);
    throw error;
  }
}

async function verifyMigration() {
  try {
    console.log('🔍 Verificando migración...');
    
    // Verificar tablas
    const tables = ['users', 'roles', 'menus', 'role_menu_permissions'];
    
    for (const table of tables) {
      const [count] = await xmlsDB.query(`SELECT COUNT(*) as count FROM app.${table};`);
      const [originalCount] = await cienciaContriDB.query(`SELECT COUNT(*) as count FROM public.${table};`);
      
      console.log(`📊 ${table}: ${count[0].count} registros migrados (original: ${originalCount[0].count})`);
      
      if (count[0].count !== originalCount[0].count) {
        console.warn(`⚠️  Advertencia: Diferencia en el número de registros para ${table}`);
      }
    }
    
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando migración de tablas de autenticación...');
    console.log('📊 Origen: ciencia_contri.public');
    console.log('🎯 Destino: xmls.app');
    console.log('');
    
    // Crear esquema app
    await createAppSchema();
    
    // Migrar tablas
    const tables = ['roles', 'users', 'menus', 'role_menu_permissions'];
    
    for (const table of tables) {
      await migrateTable(cienciaContriDB, xmlsDB, table);
    }
    
    // Migrar secuencias
    await migrateSequences();
    
    // Crear índices
    await createIndexes();
    
    // Crear claves foráneas
    await createForeignKeys();
    
    // Verificar migración
    await verifyMigration();
    
    console.log('');
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. Actualizar la configuración de la aplicación');
    console.log('2. Cambiar las referencias de DATABASE_URL a XMLS_DATABASE_URL');
    console.log('3. Actualizar los modelos para usar el esquema "app"');
    console.log('4. Probar la aplicación con la nueva configuración');
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    process.exit(1);
  } finally {
    await cienciaContriDB.close();
    await xmlsDB.close();
  }
}

// Ejecutar migración
main(); 