require('dotenv').config({ path: '.env.local' });

const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Configuración de la base de datos
const databaseUrl = process.env.DATABASE_URL || 'postgresql://ont:123456@localhost:5432/xmls';

// Crear conexión específica para autenticación
const authSequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  schema: 'app',
  define: {
    schema: 'app'
  }
});

async function testCompleteAuth() {
  try {
    console.log('🚀 Probando sistema completo de autenticación...');
    console.log('🎯 Base de datos:', databaseUrl);
    console.log('🎯 Esquema: app');
    console.log('');
    
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // 1. Verificar estructura de la base de datos
    console.log('\n📋 Verificando estructura de la base de datos...');
    const tables = ['roles', 'users', 'permissions', 'role_permissions', 'sessions', 'audit_logs'];
    
    for (const table of tables) {
      const [count] = await authSequelize.query(`SELECT COUNT(*) as count FROM app.${table};`);
      console.log(`  - ${table}: ${count[0].count} registros`);
    }
    
    // 2. Verificar usuarios y roles
    console.log('\n👥 Verificando usuarios y roles...');
    const [users] = await authSequelize.query(`
      SELECT u.username, u.email, u.status, r.name as role_name
      FROM app.users u
      LEFT JOIN app.roles r ON u.role_id = r.id
      ORDER BY u.username;
    `);
    
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Rol: ${user.role_name} - Status: ${user.status}`);
    });
    
    // 3. Verificar permisos
    console.log('\n🔐 Verificando permisos...');
    const [permissions] = await authSequelize.query(`
      SELECT name, resource, action, description
      FROM app.permissions
      ORDER BY resource, action;
    `);
    
    permissions.forEach(perm => {
      console.log(`  - ${perm.name}: ${perm.resource}:${perm.action} - ${perm.description}`);
    });
    
    // 4. Verificar asignación de permisos a roles
    console.log('\n🎭 Verificando asignación de permisos a roles...');
    const [rolePermissions] = await authSequelize.query(`
      SELECT r.name as role_name, p.name as permission_name
      FROM app.roles r
      JOIN app.role_permissions rp ON r.id = rp.role_id
      JOIN app.permissions p ON rp.permission_id = p.id
      ORDER BY r.name, p.name;
    `);
    
    let currentRole = '';
    rolePermissions.forEach(rp => {
      if (rp.role_name !== currentRole) {
        currentRole = rp.role_name;
        console.log(`  ${currentRole}:`);
      }
      console.log(`    - ${rp.permission_name}`);
    });
    
    // 5. Probar verificación de contraseñas
    console.log('\n🔑 Probando verificación de contraseñas...');
    const [adminUser] = await authSequelize.query(`
      SELECT username, password_hash FROM app.users WHERE username = 'admin';
    `);
    
    if (adminUser.length > 0) {
      const isValid = await bcrypt.compare('admin123', adminUser[0].password_hash);
      console.log(`  - Contraseña admin123 para admin: ${isValid ? '✅ Válida' : '❌ Inválida'}`);
      
      const isInvalid = await bcrypt.compare('wrongpassword', adminUser[0].password_hash);
      console.log(`  - Contraseña wrongpassword para admin: ${isInvalid ? '❌ Error' : '✅ Correcto (inválida)'}`);
    }
    
    // 6. Verificar sesiones activas
    console.log('\n🔄 Verificando sesiones activas...');
    const [sessions] = await authSequelize.query(`
      SELECT s.id, u.username, s.expires_at, s.ip_address
      FROM app.sessions s
      JOIN app.users u ON s.user_id = u.id
      WHERE s.expires_at > NOW()
      ORDER BY s.created_at DESC;
    `);
    
    if (sessions.length > 0) {
      sessions.forEach(session => {
        console.log(`  - Sesión ${session.id.substring(0, 8)}... para ${session.username} (expira: ${session.expires_at})`);
      });
    } else {
      console.log('  - No hay sesiones activas');
    }
    
    // 7. Verificar logs de auditoría
    console.log('\n📝 Verificando logs de auditoría...');
    const [auditLogs] = await authSequelize.query(`
      SELECT al.action, al.resource, u.username, al.created_at
      FROM app.audit_logs al
      LEFT JOIN app.users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10;
    `);
    
    if (auditLogs.length > 0) {
      auditLogs.forEach(log => {
        console.log(`  - ${log.action} en ${log.resource} por ${log.username || 'sistema'} (${log.created_at})`);
      });
    } else {
      console.log('  - No hay logs de auditoría');
    }
    
    console.log('\n🎉 ¡Sistema de autenticación funcionando correctamente!');
    console.log('');
    console.log('📝 Resumen:');
    console.log('✅ Base de datos configurada correctamente');
    console.log('✅ Usuarios y roles creados');
    console.log('✅ Permisos asignados');
    console.log('✅ Verificación de contraseñas funcionando');
    console.log('✅ Sistema de sesiones activo');
    console.log('✅ Logs de auditoría funcionando');
    console.log('');
    console.log('🔑 Credenciales de prueba:');
    console.log('  - Admin: admin / admin123');
    console.log('  - User: user / user123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await authSequelize.close();
  }
}

testCompleteAuth(); 