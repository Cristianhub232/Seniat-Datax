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

async function checkEjecutivoPermissions() {
  try {
    console.log('🔌 Conectando a Oracle...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a Oracle');
    
    // 1. Verificar usuario ejecutivo
    console.log('\n1️⃣ Verificando usuario ejecutivo...');
    const ejecutivoUser = await sequelize.query(`
      SELECT u.ID, u.USERNAME, u.EMAIL, u.FIRST_NAME, u.LAST_NAME, u.ROLE_ID, u.STATUS,
             r.NAME as ROLE_NAME, r.DESCRIPTION as ROLE_DESCRIPTION
      FROM CGBRITO.USERS u
      JOIN CGBRITO.ROLES r ON u.ROLE_ID = r.ID
      WHERE u.USERNAME = 'ejecutivo'
    `, { type: 'SELECT' });
    
    if (!ejecutivoUser || ejecutivoUser.length === 0) {
      console.log('❌ Usuario ejecutivo no encontrado');
      return;
    }
    
    const ejecutivo = ejecutivoUser[0];
    console.log('✅ Usuario ejecutivo encontrado:');
    console.log(`   ID: ${ejecutivo.ID}`);
    console.log(`   Username: ${ejecutivo.USERNAME}`);
    console.log(`   Role ID: ${ejecutivo.ROLE_ID}`);
    console.log(`   Role Name: ${ejecutivo.ROLE_NAME}`);
    console.log(`   Status: ${ejecutivo.STATUS}`);
    
    // 2. Verificar permisos del rol del ejecutivo
    console.log('\n2️⃣ Verificando permisos del rol del ejecutivo...');
    const rolePermissions = await sequelize.query(`
      SELECT p.ID, p.NAME, p.DESCRIPTION, p.RESOURCE_NAME, p.ACTION_NAME
      FROM CGBRITO.PERMISSIONS p
      JOIN CGBRITO.ROLE_PERMISSIONS rp ON p.ID = rp.PERMISSION_ID
      WHERE rp.ROLE_ID = :roleId
      ORDER BY p.NAME
    `, {
      replacements: { roleId: ejecutivo.ROLE_ID },
      type: 'SELECT'
    });
    
    console.log(`📊 Permisos encontrados: ${rolePermissions.length}`);
    
    if (rolePermissions.length > 0) {
      console.log('\n🔐 Permisos del rol ejecutivo:');
      rolePermissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.NAME} (${perm.RESOURCE_NAME || 'N/A'} - ${perm.ACTION_NAME || 'N/A'})`);
      });
    } else {
      console.log('⚠️ No se encontraron permisos para el rol ejecutivo');
    }
    
    // 3. Verificar si hay relaciones en ROLE_PERMISSIONS
    console.log('\n3️⃣ Verificando tabla ROLE_PERMISSIONS...');
    const rolePermCount = await sequelize.query(`
      SELECT COUNT(*) as total FROM CGBRITO.ROLE_PERMISSIONS WHERE ROLE_ID = :roleId
    `, {
      replacements: { roleId: ejecutivo.ROLE_ID },
      type: 'SELECT'
    });
    
    console.log(`🔗 Relaciones ROLE_PERMISSIONS para ejecutivo: ${rolePermCount[0].TOTAL}`);
    
    // 4. Verificar qué roles existen
    console.log('\n4️⃣ Verificando roles disponibles...');
    const allRoles = await sequelize.query(`
      SELECT ID, NAME, DESCRIPTION, IS_ACTIVE FROM CGBRITO.ROLES ORDER BY NAME
    `, { type: 'SELECT' });
    
    console.log(`📋 Roles disponibles: ${allRoles.length}`);
    allRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.NAME} (ID: ${role.ID}, Activo: ${role.IS_ACTIVE})`);
    });
    
    // 5. Verificar si hay permisos disponibles para asignar
    console.log('\n5️⃣ Verificando permisos disponibles...');
    const availablePermissions = await sequelize.query(`
      SELECT ID, NAME, RESOURCE_NAME, ACTION_NAME FROM CGBRITO.PERMISSIONS ORDER BY NAME
    `, { type: 'SELECT' });
    
    console.log(`📋 Permisos disponibles: ${availablePermissions.length}`);
    if (availablePermissions.length > 0) {
      console.log('   Primeros 10 permisos:');
      availablePermissions.slice(0, 10).forEach((perm, index) => {
        console.log(`     ${index + 1}. ${perm.NAME} (${perm.RESOURCE_NAME || 'N/A'} - ${perm.ACTION_NAME || 'N/A'})`);
      });
    }
    
    console.log('\n🎉 Verificación de permisos del ejecutivo completada!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkEjecutivoPermissions();
