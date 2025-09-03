import { DataTypes, Model, Optional } from 'sequelize';
import { authSequelize } from '@/lib/db';

// Interfaz para los atributos del permiso
export interface PermissionAttributes {
  id: number;
  name: string;
  description?: string;
  resource_name?: string;
  action_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaz para la creación de permisos
export interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public resource_name?: string;
  public action_name?: string;
  public created_at?: Date;
  public updated_at?: Date;

  // Métodos de instancia
  public get fullPermission(): string {
    if (this.resource_name && this.action_name) {
      return `${this.resource_name}.${this.action_name}`;
    }
    return this.name;
  }

  public matches(resource: string, action: string): boolean {
    return this.resource_name === resource && this.action_name === action;
  }

  public matchesPattern(pattern: string): boolean {
    const [resource, action] = pattern.split('.');
    return this.matches(resource, action);
  }
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 100],
        is: /^[a-z]+\.[a-z]+$/,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resource_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [1, 100],
      },
    },
    action_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [1, 50],
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: authSequelize,
    schema: 'CGBRITO',
    tableName: 'PERMISSIONS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
      {
        fields: ['resource_name'],
      },
      {
        fields: ['action_name'],
      },
    ],
    hooks: {
      beforeCreate: (permission: Permission) => {
        // Extraer resource y action del nombre si no están definidos
        if (!permission.resource_name || !permission.action_name) {
          const [resource, action] = permission.name.split('.');
          permission.resource_name = resource;
          permission.action_name = action;
        }
      },
      beforeUpdate: (permission: Permission) => {
        permission.updated_at = new Date();
      },
    },
  }
);

export default Permission;

