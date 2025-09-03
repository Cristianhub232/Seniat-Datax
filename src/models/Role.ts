import { DataTypes, Model, Optional } from 'sequelize';
import { authSequelize } from '@/lib/db';

// Interfaz para los atributos del rol
export interface RoleAttributes {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaz para la creación de roles
export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public is_active!: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  // Métodos de instancia
  public isActive(): boolean {
    return this.is_active;
  }

  public activate(): void {
    this.is_active = true;
  }

  public deactivate(): void {
    this.is_active = false;
  }
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        len: [2, 50],
        is: /^[A-Z_]+$/,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'ROLES',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
      {
        fields: ['is_active'],
      },
    ],
    hooks: {
      beforeUpdate: (role: Role) => {
        role.updated_at = new Date();
      },
    },
  }
);

export default Role;

