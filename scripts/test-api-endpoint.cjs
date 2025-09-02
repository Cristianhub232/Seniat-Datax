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

// Simular la función de login del controlador
async function loginUser(username, password) {
  try {
    console.log(`🔍 Buscando usuario: ${username}`);
    
    // Buscar el usuario con su rol
    const user = await User.findOne({
      where: { username },
      include: [{ model: Role, as: "role", attributes: ["name"] }],
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return { error: "Usuario no encontrado" };
    }

    console.log('✅ Usuario encontrado:', user.username);
    console.log('📧 Email:', user.email);
    console.log('🔑 Password hash:', user.password_hash.substring(0, 20) + '...');
    console.log('🎭 Rol:', user.role ? user.role.name : 'Sin rol');

    // Verificar contraseña (simulado)
    const passwordHash = user.getDataValue("password_hash");
    console.log('🔍 Verificando contraseña...');
    
    // Por ahora, solo verificamos que el hash existe
    if (!passwordHash) {
      console.log('❌ No hay hash de contraseña');
      return { error: "Usuario o contraseña inválidos" };
    }

    // Simular verificación exitosa
    console.log('✅ Contraseña válida (simulado)');

    const userId = user.getDataValue("id");
    const userRole = user.get("role");

    if (!userRole || !userRole.name) {
      console.log('❌ El usuario no tiene un rol válido asignado');
      return { error: "El usuario no tiene un rol válido asignado" };
    }

    console.log('🎉 Login exitoso!');
    return {
      message: "Login exitoso",
      id: userId,
      username: user.getDataValue("username"),
      role: userRole.name
    };
  } catch (err) {
    console.error('❌ Error en loginUser:', err);
    console.error('Stack:', err.stack);
    return { error: "Error interno del servidor" };
  }
}

async function testLogin() {
  try {
    console.log('🔍 Probando función de login...');
    console.log('🎯 Base de datos:', databaseUrl);
    console.log('🎯 Esquema: app');
    console.log('');
    
    await authSequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Probar login
    const result = await loginUser('admin', 'admin123');
    console.log('\n📝 Resultado:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await authSequelize.close();
  }
}

testLogin(); 