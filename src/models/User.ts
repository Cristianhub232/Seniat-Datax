import { DataTypes, Model, Optional } from 'sequelize';
import { authSequelize } from '@/lib/db';

// Interfaz para los atributos del usuario
export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role_id: number;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: Date;
  login_attempts: number;
  locked_until?: Date;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaz para la creación de usuarios (sin campos opcionales)
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'login_attempts' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public first_name?: string;
  public last_name?: string;
  public role_id!: number;
  public status!: 'active' | 'inactive' | 'suspended';
  public last_login?: Date;
  public login_attempts!: number;
  public locked_until?: Date;
  public avatar?: string;
  public phone?: string;
  public location?: string;
  public bio?: string;
  public created_at?: Date;
  public updated_at?: Date;

  // Métodos de instancia
  public get fullName(): string {
    return `${this.first_name || ''} ${this.last_name || ''}`.trim() || this.username;
  }

  public isLocked(): boolean {
    if (!this.locked_until) return false;
    return new Date() < this.locked_until;
  }

  public canLogin(): boolean {
    return this.status === 'active' && !this.isLocked();
  }

  public incrementLoginAttempts(): void {
    this.login_attempts += 1;
    if (this.login_attempts >= 5) {
      // Bloquear por 30 minutos después de 5 intentos fallidos
      this.locked_until = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  public resetLoginAttempts(): void {
    this.login_attempts = 0;
    this.locked_until = undefined;
  }
}

User.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 50],
        is: /^[a-zA-Z0-9_-]+$/,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [1, 50],
      },
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [1, 50],
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ROLES',
        key: 'ID',
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'suspended']],
      },
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10,
      },
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [7, 20],
      },
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'USERS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['username'],
      },
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role_id'],
      },
      {
        fields: ['status'],
      },
    ],
    hooks: {
      beforeCreate: (user: User) => {
        if (!user.id) {
          user.id = require('uuid').v4();
        }
      },
      beforeUpdate: (user: User) => {
        user.updated_at = new Date();
      },
    },
  }
);

export default User;

