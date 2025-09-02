require('dotenv').config({ path: '.env.local' });

const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const databaseUrl = process.env.DATABASE_URL || 'postgresql://ont:123456@localhost:5432/xmls';

// Crear conexión específica para autenticación (esquema app)
const authSequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: console.log, // Habilitar logging para ver las consultas SQL
  schema: 'app',
  define: {
    schema: 'app'
  }
});

// Definir modelo User
const User = authSequelize.define(
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
const Role = authSequelize.define(
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

async function testLogin() {
  try {
    console.log('🔍 Probando login con configuración de autenticación...');
    console.log('🎯 Base de datos:', databaseUrl);
    console.log('🎯 Esquema: app');
    console.log('');
    
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Probar consulta de login
    console.log('\n🔐 Probando consulta de login para usuario "admin"...');
    const user = await User.findOne({
      where: { username: 'admin' },
      include: [{ model: Role, as: 'role', attributes: ['name'] }]
    });

    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log(`  - Username: ${user.username}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Status: ${user.status}`);
      if (user.role) {
        console.log(`  - Rol: ${user.role.name}`);
      } else {
        console.log('  - Rol: No asignado');
      }
      console.log('🎉 ¡Login simulado exitoso!');
    } else {
      console.log('❌ Usuario admin no encontrado');
    }
    
    // Verificar todos los usuarios
    console.log('\n👥 Verificando todos los usuarios...');
    const allUsers = await User.findAll({
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
      limit: 5
    });
    
    console.log(`Encontrados ${allUsers.length} usuarios:`);
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - Rol: ${user.role ? user.role.name : 'Sin rol'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await authSequelize.close();
  }
}

testLogin(); 