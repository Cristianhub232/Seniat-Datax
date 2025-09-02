const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const config = {
  username: "ont",
  password: "123456",
  database: "xmls",
  host: "localhost",
  dialect: "postgres"
};

const sequelize = new Sequelize(config);

async function insertDashboardMenu() {
  try {
    console.log('📊 Insertando menú del Dashboard...\n');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Insertar el menú del dashboard
    const [result] = await sequelize.query(`
      INSERT INTO app.menus (
        nombre_menu,
        url_menu,
        icono_menu,
        orden_menu,
        estado_menu,
        created_at,
        updated_at
      ) VALUES (
        'Dashboard',
        '/dashboard',
        'IconHome',
        1,
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (url_menu) DO UPDATE SET
        nombre_menu = EXCLUDED.nombre_menu,
        icono_menu = EXCLUDED.icono_menu,
        orden_menu = EXCLUDED.orden_menu,
        estado_menu = EXCLUDED.estado_menu,
        updated_at = NOW()
      RETURNING id, nombre_menu, url_menu, icono_menu, orden_menu, estado_menu
    `);

    if (result.length > 0) {
      const menu = result[0];
      console.log('✅ Menú del Dashboard insertado/actualizado exitosamente:');
      console.log(`   ID: ${menu.id}`);
      console.log(`   Nombre: ${menu.nombre_menu}`);
      console.log(`   URL: ${menu.url_menu}`);
      console.log(`   Icono: ${menu.icono_menu}`);
      console.log(`   Orden: ${menu.orden_menu}`);
      console.log(`   Estado: ${menu.estado_menu ? 'Activo' : 'Inactivo'}`);
    }

    // Actualizar el orden de los otros menús
    console.log('\n🔄 Actualizando orden de otros menús...');
    
    const updateQueries = [
      "UPDATE app.menus SET orden_menu = 2 WHERE url_menu = '/usuarios'",
      "UPDATE app.menus SET orden_menu = 3 WHERE url_menu = '/roles'",
      "UPDATE app.menus SET orden_menu = 4 WHERE url_menu = '/empresas-petroleras'",
      "UPDATE app.menus SET orden_menu = 5 WHERE url_menu = '/formas'",
      "UPDATE app.menus SET orden_menu = 6 WHERE url_menu = '/codigos-presupuestarios'",
      "UPDATE app.menus SET orden_menu = 7 WHERE url_menu = '/bancos'",
      "UPDATE app.menus SET orden_menu = 8 WHERE url_menu = '/consulta-formas'",
      "UPDATE app.menus SET orden_menu = 9 WHERE url_menu = '/consulta-bancos'",
      "UPDATE app.menus SET orden_menu = 10 WHERE url_menu = '/planillas-recaudacion'",
      "UPDATE app.menus SET orden_menu = 11 WHERE url_menu = '/formas-no-validadas'",
      "UPDATE app.menus SET orden_menu = 12 WHERE url_menu = '/creacion-conceptos'",
      "UPDATE app.menus SET orden_menu = 13 WHERE url_menu = '/reportes-cierre'"
    ];

    for (const query of updateQueries) {
      await sequelize.query(query);
    }

    console.log('✅ Orden de menús actualizado\n');

    // Verificar el menú insertado
    const [menus] = await sequelize.query(`
      SELECT id, nombre_menu, url_menu, icono_menu, orden_menu, estado_menu
      FROM app.menus
      ORDER BY orden_menu ASC
    `);

    console.log('📋 Lista completa de menús:');
    menus.forEach(menu => {
      console.log(`   ${menu.orden_menu}. ${menu.nombre_menu} (${menu.url_menu}) - ${menu.estado_menu ? '✅' : '❌'}`);
    });

    console.log('\n🎉 ¡Menú del Dashboard configurado exitosamente!');
    console.log('🚀 El dashboard será la primera opción en el menú lateral');

  } catch (error) {
    console.error('❌ Error insertando menú del dashboard:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar inserción
insertDashboardMenu(); 