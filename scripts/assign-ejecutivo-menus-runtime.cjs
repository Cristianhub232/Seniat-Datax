const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  let connection;
  try {
    const config = {
      user: process.env.ORACLE_USERNAME || 'CGBRITO',
      password: process.env.ORACLE_PASSWORD || 'cgkbrito',
      connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`
    };

    console.log('🔌 Conectando a Oracle...');
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa');

    connection.autoCommit = false;

    // Obtener ROLE_ID de EJECUTIVO
    const roleRes = await connection.execute(
      `SELECT ID FROM CGBRITO.ROLES WHERE UPPER(NAME) = 'EJECUTIVO'`
    );
    if (!roleRes.rows || roleRes.rows.length === 0) {
      throw new Error('Rol EJECUTIVO no encontrado');
    }
    const roleId = roleRes.rows[0][0];
    console.log('🎯 ROLE_ID (EJECUTIVO):', roleId);

    // Permiso por defecto para ROLE_MENU_PERMISSIONS
    let defaultPermissionId = 1;
    try {
      const permRes = await connection.execute(
        `SELECT ID FROM CGBRITO.PERMISSIONS WHERE NAME = 'dashboard.access'`
      );
      if (permRes.rows && permRes.rows.length > 0) {
        defaultPermissionId = permRes.rows[0][0];
      }
    } catch {}
    console.log('🛡️ Permiso por defecto:', defaultPermissionId);

    // Menús que debe ver EJECUTIVO
    const desiredMenus = [
      { name: 'Dashboard', route: '/dashboard', icon: 'IconHome', order: 1 },
      { name: 'Tickets', route: '/tickets', icon: 'IconTicket', order: 2 },
      { name: 'Cartera', route: '/cartera-contribuyentes', icon: 'IconWallet', order: 3 },
      { name: 'Pagos ejecutados', route: '/pagos-ejecutados', icon: 'IconCreditCard', order: 4 },
      { name: 'Obligaciones', route: '/obligaciones', icon: 'IconFile', order: 5 },
      { name: 'Metabase', route: '/metabase', icon: 'IconChart', order: 6 }
    ];

    let menusCreated = 0;
    let linksCreated = 0;

    for (const item of desiredMenus) {
      // Buscar o crear menú
      const existing = await connection.execute(
        `SELECT ID FROM CGBRITO.MENUS WHERE ROUTE = :route`,
        { route: item.route },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      let menuId;
      if (existing.rows && existing.rows.length > 0) {
        menuId = existing.rows[0].ID;
        // Actualizar nombre/icono/orden si cambió
        await connection.execute(
          `UPDATE CGBRITO.MENUS SET NAME = :name, ICON = :icon, ORDER_INDEX = :ord, IS_ACTIVE = 1, UPDATED_AT = SYSDATE WHERE ID = :id`,
          { name: item.name, icon: item.icon, ord: item.order, id: menuId }
        );
      } else {
        // Obtener siguiente ID
        const maxRes = await connection.execute(`SELECT NVL(MAX(ID), 0) + 1 AS NEXT_ID FROM CGBRITO.MENUS`);
        menuId = maxRes.rows[0][0];
        await connection.execute(
          `INSERT INTO CGBRITO.MENUS (ID, NAME, ICON, ROUTE, PARENT_ID, ORDER_INDEX, IS_ACTIVE, CREATED_AT, UPDATED_AT)
           VALUES (:id, :name, :icon, :route, NULL, :ord, 1, SYSDATE, SYSDATE)`,
          { id: menuId, name: item.name, icon: item.icon, route: item.route, ord: item.order }
        );
        menusCreated++;
        console.log(`   ➕ Menú creado: ${item.name} (${menuId})`);
      }

      // Crear enlace en ROLE_MENU_PERMISSIONS si no existe
      const linkExists = await connection.execute(
        `SELECT COUNT(*) AS CNT FROM CGBRITO.ROLE_MENU_PERMISSIONS WHERE ROLE_ID = :roleId AND MENU_ID = :menuId`,
        { roleId, menuId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const count = Number(linkExists.rows[0].CNT || 0);
      if (count === 0) {
        const nextLinkIdRes = await connection.execute(`SELECT NVL(MAX(ID), 0) + 1 AS NEXT_ID FROM CGBRITO.ROLE_MENU_PERMISSIONS`);
        const linkId = nextLinkIdRes.rows[0][0];
        await connection.execute(
          `INSERT INTO CGBRITO.ROLE_MENU_PERMISSIONS (ID, ROLE_ID, MENU_ID, PERMISSION_ID)
           VALUES (:id, :roleId, :menuId, :permId)`,
          { id: linkId, roleId, menuId, permId: defaultPermissionId }
        );
        linksCreated++;
        console.log(`   🔗 Enlace creado: ROLE ${roleId} → MENU ${menuId}`);
      }
    }

    await connection.commit();
    console.log(`\n✅ Completado. Menús creados: ${menusCreated}, enlaces creados: ${linksCreated}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    process.exitCode = 1;
  } finally {
    if (connection) {
      try { await connection.close(); console.log('🔒 Conexión cerrada'); } catch {}
    }
  }
}

run();


