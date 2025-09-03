const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const cfg = {
    user: process.env.ORACLE_USERNAME || 'CGBRITO',
    password: process.env.ORACLE_PASSWORD || 'cgkbrito',
    connectString: `${process.env.ORACLE_HOST || '172.16.32.73'}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_DATABASE || 'DWREPO'}`
  };
  let c;
  try {
    c = await oracledb.getConnection(cfg);
    const menus = await c.execute(
      `SELECT ID, NAME, ROUTE, ICON, NVL(IS_ACTIVE,1) IS_ACTIVE, NVL(ORDER_INDEX,999) ORDER_INDEX
       FROM CGBRITO.MENUS
       ORDER BY ORDER_INDEX, ID`
    );
    console.log('\nMENUS (ID | NAME | ROUTE | ICON | ACTIVE | ORDER)');
    for (const r of menus.rows) {
      console.log(`${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} | ${r[5]}`);
    }

    const role = await c.execute(`SELECT ID FROM CGBRITO.ROLES WHERE UPPER(NAME)='EJECUTIVO'`);
    const roleId = role.rows?.[0]?.[0];
    const rmp = await c.execute(
      `SELECT rmp.ID, m.NAME, m.ROUTE
       FROM CGBRITO.ROLE_MENU_PERMISSIONS rmp
       JOIN CGBRITO.MENUS m ON m.ID = rmp.MENU_ID
       WHERE rmp.ROLE_ID = :rid
       ORDER BY m.ORDER_INDEX, m.ID`,
       { rid: roleId }
    );
    console.log('\nROLE_MENU_PERMISSIONS para EJECUTIVO (ID | NAME | ROUTE)');
    for (const r of rmp.rows) {
      console.log(`${r[0]} | ${r[1]} | ${r[2]}`);
    }

    const checks = [
      ['Cartera', '/cartera-contribuyentes'],
      ['Pagos ejecutados', '/pagos-ejecutados'],
      ['Tickets', '/tickets'],
      ['Obligaciones', '/obligaciones'],
      ['Metabase', '/metabase'],
      ['Configuración', '/configuracion'],
      ['Ayuda', '/ayuda'],
    ];
    console.log('\nVerificación de módulos solicitados (NAME | ROUTE | EXISTS_IN_MENUS)');
    for (const [name, route] of checks) {
      const ex = await c.execute(
        `SELECT COUNT(*) FROM CGBRITO.MENUS WHERE UPPER(NAME)=UPPER(:n) OR UPPER(ROUTE)=UPPER(:r)`,
        { n: name, r: route }
      );
      const exists = ex.rows?.[0]?.[0] > 0 ? 'SI' : 'NO';
      console.log(`${name} | ${route} | ${exists}`);
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    if (c) await c.close();
  }
}

run();


