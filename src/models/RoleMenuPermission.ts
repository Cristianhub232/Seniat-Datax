import { DataTypes } from 'sequelize';
import { authSequelize } from '@/lib/db';

// Tener en nombre en cuenta en CamelCase y snake_case
const RoleMenuPermission = authSequelize.define('RoleMenuPermission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "CGBRITO.ROLES",
      key: "ID",
    },
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "CGBRITO.MENUS",
      key: "ID",
    },
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "CGBRITO.PERMISSIONS",
      key: "ID",
    },
  },
}, {
  schema: 'CGBRITO',
  tableName: 'ROLE_MENU_PERMISSIONS',
  timestamps: true,
  createdAt: "CREATED_AT",
  updatedAt: false,
});

export default RoleMenuPermission;