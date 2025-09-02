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

async function insertFormasNoValidadasMenu() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Insertar menú de formas no validadas
    const formasNoValidadasMenu = {
      key: 'formas-no-validadas',
      label: 'Formas no Validadas',
      icon: 'IconAlertTriangle',
      route: '/formas-no-validadas',
      parentId: null,
      section: 'main',
      status: true,
      metabaseID: null
    };

    console.log('📝 Insertando menú de formas no validadas...');
    
    // Generar UUID
    const { v4: uuidv4 } = require('uuid');
    const menuId = uuidv4();
    
    // Insertar directamente con SQL
    const insertQuery = `
      INSERT INTO public.menus (id, key, label, icon, route, parent_id, section, status, metabase_dashboard_id)
      VALUES ($1, 'formas-no-validadas', 'Formas no Validadas', 'IconAlertTriangle', '/formas-no-validadas', NULL, 'main', true, NULL)
      ON CONFLICT (key) DO NOTHING
      RETURNING id, key, label, route;
    `;
    
    const result = await sequelize.query(insertQuery, { 
      type: Sequelize.QueryTypes.INSERT,
      bind: [menuId]
    });
    
    if (result && result[0] && result[0].length > 0) {
      const menu = result[0][0];
      console.log('✅ Menú de formas no validadas creado exitosamente');
      console.log('📋 Detalles del menú:');
      console.log(`   - ID: ${menu.id}`);
      console.log(`   - Key: ${menu.key}`);
      console.log(`   - Label: ${menu.label}`);
      console.log(`   - Route: ${menu.route}`);
    } else {
      console.log('ℹ️ El menú de formas no validadas ya existe');
    }

    // Obtener el orden máximo actual
    const [maxOrderResult] = await sequelize.query(`
      SELECT COALESCE(MAX(orden), 0) as max_orden
      FROM public.menus
      WHERE status = true
    `);

    const maxOrder = maxOrderResult[0].max_orden;
    const newOrder = maxOrder + 1;

    // Actualizar el orden del menú de formas no validadas
    await sequelize.query(`
      UPDATE public.menus 
      SET orden = $1 
      WHERE key = 'formas-no-validadas'
    `, { bind: [newOrder] });

    console.log(`📊 Orden del menú actualizado a: ${newOrder}`);

    // Verificar el menú insertado
    const [menuResult] = await sequelize.query(`
      SELECT id, key, label, icon, route, orden, status
      FROM public.menus 
      WHERE key = 'formas-no-validadas'
    `);

    if (menuResult.length > 0) {
      const menu = menuResult[0];
      console.log('✅ Menú verificado:');
      console.log(`   - ID: ${menu.id}`);
      console.log(`   - Key: ${menu.key}`);
      console.log(`   - Label: ${menu.label}`);
      console.log(`   - Icon: ${menu.icon}`);
      console.log(`   - Route: ${menu.route}`);
      console.log(`   - Orden: ${menu.orden}`);
      console.log(`   - Status: ${menu.status}`);
    }

    console.log('🎉 Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

insertFormasNoValidadasMenu(); 