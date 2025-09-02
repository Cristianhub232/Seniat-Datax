const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'oracle',
  host: '172.16.32.73',
  port: 1521,
  database: 'DWREPO',
  username: 'CGBRITO',
  password: 'cgkbrito',
  logging: false
});

async function debugPermissionsQuery() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar usuario admin
    console.log('\n1️⃣ Verificando usuario admin...');
    const adminUser = await sequelize.query(`
      SELECT u.ID, u.USERNAME, u.ROLE_ID, r.NAME as ROLE_NAME
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = 'admin'
    `, { type: 'SELECT' });
    
    if (!adminUser || adminUser.length === 0) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    const admin = adminUser[0];
    console.log('✅ Usuario admin encontrado:');
    console.log(`   ID: ${admin.ID}`);
    console.log(`   Role ID: ${admin.ROLE_ID}`);
    console.log(`   Role Name: ${admin.ROLE_NAME}`);
    
    // 2. Verificar permisos directamente
    console.log('\n2️⃣ Verificando permisos directamente...');
    const directPermissions = await sequelize.query(`
      SELECT p.ID, p.NAME, p.DESCRIPTION, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
      ORDER BY p.NAME
    `, {
      replacements: { roleId: admin.ROLE_ID },
      type: 'SELECT'
    });
    
    console.log(`📊 Permisos encontrados directamente: ${directPermissions.length}`);
    if (directPermissions.length > 0) {
      console.log('🔐 Permisos:');
      directPermissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.NAME} (${perm.RESOURCE_NAME || 'N/A'} - ${perm.ACTION_NAME || 'N/A'})`);
      });
    }
    
    // 3. Verificar la consulta que usa el controlador
    console.log('\n3️⃣ Verificando consulta del controlador...');
    const controllerQuery = await sequelize.query(`
      SELECT p.NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
    `, {
      replacements: { roleId: admin.ROLE_ID },
      type: 'SELECT'
    });
    
    console.log(`📊 Resultado de consulta del controlador: ${controllerQuery.length}`);
    if (controllerQuery.length > 0) {
      console.log('🔐 Nombres de permisos:');
      controllerQuery.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.NAME}`);
      });
    }
    
    // 4. Verificar si hay problemas con la estructura de datos
    console.log('\n4️⃣ Verificando estructura de datos...');
    const samplePermission = await sequelize.query(`
      SELECT * FROM CGBRITO.PERMISSIONS WHERE ID = 1
    `, { type: 'SELECT' });
    
    if (samplePermission.length > 0) {
      console.log('📋 Estructura de un permiso de ejemplo:');
      console.log(JSON.stringify(samplePermission[0], null, 2));
    }
    
    // 5. Verificar la relación role_permissions
    console.log('\n5️⃣ Verificando relación role_permissions...');
    const rolePermSample = await sequelize.query(`
      SELECT * FROM CGBRITO.ROLE_PERMISSIONS WHERE ROLE_ID = :roleId LIMIT 3
    `, {
      replacements: { roleId: admin.ROLE_ID },
      type: 'SELECT'
    });
    
    if (rolePermSample.length > 0) {
      console.log('🔗 Estructura de role_permissions:');
      console.log(JSON.stringify(rolePermSample[0], null, 2));
    }
    
    console.log('\n🎉 Debug de permisos completado!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

debugPermissionsQuery();
