const { Sequelize } = require('sequelize');

// Configuración Oracle
const sequelize = new Sequelize({
  dialect: 'oracle',
  host: '172.16.32.73',
  port: 1521,
  database: 'DWREPO',
  username: 'CGBRITO',
  password: 'cgkbrito',
  logging: console.log,
  dialectOptions: {
    connectString: '172.16.32.73:1521/DWREPO',
    schema: 'CGBRITO'
  }
});

// Definir modelo User simple para prueba
const User = sequelize.define('User', {
  id: {
    type: Sequelize.STRING(36),
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  password_hash: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  first_name: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  last_name: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  role_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING(20),
    defaultValue: 'active',
  },
}, {
  schema: 'CGBRITO',
  tableName: 'USERS',
  timestamps: true,
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT',
});

async function testUserModel() {
  try {
    console.log('🔌 Probando modelo User con Oracle...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Probar consulta con el modelo
    console.log('📋 Probando consulta con modelo User...');
    const user = await User.findOne({
      where: { 
        username: 'admin',
        status: 'active'
      }
    });
    
    if (user) {
      console.log('✅ Usuario encontrado con modelo:');
      console.log('   ID:', user.id);
      console.log('   Username:', user.username);
      console.log('   Email:', user.email);
      console.log('   First Name:', user.first_name);
      console.log('   Last Name:', user.last_name);
      console.log('   Role ID:', user.role_id);
      console.log('   Status:', user.status);
    } else {
      console.log('❌ Usuario no encontrado con modelo');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

testUserModel(); 