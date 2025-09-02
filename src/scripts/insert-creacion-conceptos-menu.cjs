const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

// Configuración de la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// Modelos
const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  route: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metabase_dashboard_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'menus',
  timestamps: false
});

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'roles',
  timestamps: true
});

const RoleMenuPermission = sequelize.define('RoleMenuPermission', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  menu_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  can_view: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  can_edit: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  }
}, {
  tableName: 'role_menu_permissions',
  timestamps: false
});

async function insertCreacionConceptosMenu() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Insertar el menú de Creación de Conceptos
    const [menu, created] = await Menu.findOrCreate({
      where: { label: 'Creación de Conceptos' },
      defaults: {
        key: 'creacion-conceptos',
        label: 'Creación de Conceptos',
        route: '/creacion-conceptos',
        icon: 'IconLink',
        section: 'main',
        status: true,
        orden: 9 // Después de "Formas no Validadas"
      }
    });

    if (created) {
      console.log('✅ Menú "Creación de Conceptos" creado exitosamente.');
    } else {
      console.log('ℹ️ El menú "Creación de Conceptos" ya existe.');
    }

    // Obtener todos los roles activos
    const roles = await Role.findAll({
      where: { status: 'activo' }
    });

    console.log(`📋 Encontrados ${roles.length} roles activos.`);

    // Asignar permisos a todos los roles
    for (const role of roles) {
      const [permission, permissionCreated] = await RoleMenuPermission.findOrCreate({
        where: {
          role_id: role.id,
          menu_id: menu.id
        },
        defaults: {
          role_id: role.id,
          menu_id: menu.id,
          can_view: true,
          can_edit: true
        }
      });

      if (permissionCreated) {
        console.log(`✅ Permisos asignados al rol: ${role.name}`);
      } else {
        console.log(`ℹ️ Permisos ya existentes para el rol: ${role.name}`);
      }
    }

    console.log('🎉 Proceso completado exitosamente.');
    console.log(`📊 Resumen:`);
    console.log(`   - Menú: ${menu.label}`);
    console.log(`   - Ruta: ${menu.route}`);
    console.log(`   - Icono: ${menu.icon}`);
    console.log(`   - Orden: ${menu.orden}`);
    console.log(`   - Roles con permisos: ${roles.length}`);

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
insertCreacionConceptosMenu(); 