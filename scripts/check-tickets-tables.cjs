// Verificación no destructiva de tablas de tickets en Oracle
const oracledb = require('oracledb');
require('dotenv').config({ path: '/home/k8s/app/.env.local' });

async function main() {
  let connection;
  try {
    const cfg = {
      user: process.env.ORACLE_USERNAME,
      password: process.env.ORACLE_PASSWORD,
      connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DATABASE}`,
    };

    const owner = (process.env.ORACLE_SCHEMA || 'CGBRITO').toUpperCase();

    connection = await oracledb.getConnection(cfg);

    const tablesRes = await connection.execute(
      `SELECT owner, table_name FROM all_tables WHERE owner = :owner AND table_name IN ('TICKETS','TICKET_HISTORY') ORDER BY table_name`,
      { owner }
    );

    const columnsRes = await connection.execute(
      `SELECT table_name, column_name, data_type, data_length, nullable
       FROM all_tab_columns WHERE owner = :owner AND table_name IN ('TICKETS','TICKET_HISTORY')
       ORDER BY table_name, column_id`,
      { owner }
    );

    const usersColsRes = await connection.execute(
      `SELECT table_name, column_name, data_type, data_length, nullable
       FROM all_tab_columns WHERE owner = :owner AND table_name = 'USERS' AND column_name IN ('ID','ROLE_ID')
       ORDER BY column_id`,
      { owner }
    );

    const counts = [];
    for (const row of tablesRes.rows || []) {
      const tableName = row[1];
      try {
        const cnt = await connection.execute(`SELECT COUNT(*) FROM ${owner}."${tableName}"`);
        counts.push({ table: tableName, count: cnt.rows && cnt.rows[0] ? cnt.rows[0][0] : null });
      } catch (e) {
        counts.push({ table: tableName, error: e.message });
      }
    }

    console.log(JSON.stringify({ owner, tables: tablesRes.rows, columns: columnsRes.rows, users_columns: usersColsRes.rows, counts }, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}

main();


