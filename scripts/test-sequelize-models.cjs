const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const databaseUrl = 'postgresql://ont:123456@localhost:5432/xmls';

// Crear conexión con esquema específico
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: console.log, // Habilitar logging para ver las consultas SQL
  schema: 'app',
  define: {
    schema: 'app'
  }
});

// Definir modelo User similar al de la aplicación
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    schema: "app",
    tableName: "users",
    timestamps: false,
  }
);

// Definir modelo Role
const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("activo", "inactivo"),
      defaultValue: "activo",
    },
  },
  {
    schema: "app",
    tableName: "roles",
    timestamps: true,
  }
);

// Configurar asociaciones
User.belongsTo(Role, { 
  foreignKey: 'role_id', 
  as: 'role',
  targetKey: 'id'
});

Role.hasMany(User, { 
  foreignKey: 'role_id', 
  as: 'users',
  sourceKey: 'id'
});

async function testModels() {
  try {
    console.log('🔍 Probando modelos de Sequelize...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Probar consulta simple
    console.log('\n📋 Probando consulta simple...');
    const users = await User.findAll({
      limit: 3
    });
    
    console.log(`Encontrados ${users.length} usuarios`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
    });
    
    // Probar consulta con include
    console.log('\n🔗 Probando consulta con include...');
    const userWithRole = await User.findOne({
      where: { username: 'admin' },
      include: [{ model: Role, as: 'role', attributes: ['name'] }]
    });
    
    if (userWithRole) {
      console.log(`Usuario encontrado: ${userWithRole.username}`);
      if (userWithRole.role) {
        console.log(`Rol: ${userWithRole.role.name}`);
      } else {
        console.log('No tiene rol asignado');
      }
    } else {
      console.log('Usuario admin no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testModels(); 