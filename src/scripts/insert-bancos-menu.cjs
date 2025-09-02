require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
const { Sequelize } = require('sequelize');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function insertBancosMenu() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Insertar menú de bancos
    const bancosMenu = {
      key: 'consulta-bancos',
      label: 'Consulta de Bancos',
      icon: 'IconBuilding',
      route: '/consulta-bancos',
      parentId: null,
      section: 'main',
      status: true,
      metabaseID: null
    };

    console.log('📝 Insertando menú de bancos...');
    
    // Generar UUID
    const { v4: uuidv4 } = require('uuid');
    const menuId = uuidv4();
    
    // Insertar directamente con SQL
    const insertQuery = `
      INSERT INTO public.menus (id, key, label, icon, route, parent_id, section, status, metabase_dashboard_id)
      VALUES ($1, 'consulta-bancos', 'Consulta de Bancos', 'IconBuilding', '/consulta-bancos', NULL, 'main', true, NULL)
      ON CONFLICT (key) DO NOTHING
      RETURNING id, key, label, route;
    `;
    
    const result = await sequelize.query(insertQuery, { 
      type: Sequelize.QueryTypes.INSERT,
      bind: [menuId]
    });
    
    if (result && result[0] && result[0].length > 0) {
      const menu = result[0][0];
      console.log('✅ Menú de bancos creado exitosamente');
      console.log('📋 Detalles del menú:');
      console.log(`   - ID: ${menu.id}`);
      console.log(`   - Key: ${menu.key}`);
      console.log(`   - Label: ${menu.label}`);
      console.log(`   - Route: ${menu.route}`);
    } else {
      console.log('ℹ️ El menú de bancos ya existe');
    }

    console.log('🎉 Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

insertBancosMenu(); 