import { DataTypes, Model, Optional } from 'sequelize';
import { authSequelize } from '@/lib/db';

// Interfaz para los atributos de la sesión
export interface SessionAttributes {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaz para la creación de sesiones
export interface SessionCreationAttributes extends Optional<SessionAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: string;
  public user_id!: string;
  public token!: string;
  public expires_at!: Date;
  public ip_address?: string;
  public user_agent?: string;
  public is_active!: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  // Métodos de instancia
  public isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  public isValid(): boolean {
    return this.is_active && !this.isExpired();
  }

  public deactivate(): void {
    this.is_active = false;
  }

  public extend(duration: number): void {
    this.expires_at = new Date(Date.now() + duration);
  }
}

Session.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'USERS',
        key: 'ID',
      },
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      validate: {
        isIP: true,
      },
    },
    user_agent: {
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
    tableName: 'SESSIONS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['token'],
      },
      {
        fields: ['expires_at'],
      },
      {
        fields: ['is_active'],
      },
    ],
    hooks: {
      beforeCreate: (session: Session) => {
        if (!session.id) {
          session.id = require('uuid').v4();
        }
      },
      beforeUpdate: (session: Session) => {
        session.updated_at = new Date();
      },
    },
  }
);

export default Session;

