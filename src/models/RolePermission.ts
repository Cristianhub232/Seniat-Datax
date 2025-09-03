import { DataTypes, Model } from 'sequelize';
import { authSequelize } from '@/lib/db';

// Interfaz para los atributos de la relación rol-permiso
export interface RolePermissionAttributes {
  id: number;
  role_id: number;
  permission_id: number;
  created_at?: Date;
}

class RolePermission extends Model<RolePermissionAttributes> implements RolePermissionAttributes {
  public id!: number;
  public role_id!: number;
  public permission_id!: number;
  public created_at?: Date;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ROLES',
        key: 'ID',
      },
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PERMISSIONS',
        key: 'ID',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: authSequelize,
    schema: 'CGBRITO',
    tableName: 'ROLE_PERMISSIONS',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['role_id', 'permission_id'],
        name: 'UQ_ROLE_PERMISSION',
      },
      {
        fields: ['role_id'],
      },
      {
        fields: ['permission_id'],
      },
    ],
  }
);

export default RolePermission;

