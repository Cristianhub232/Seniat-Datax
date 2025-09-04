import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '@/lib/db';

export interface TicketAttributes {
  id?: number;
  asunto: string;
  concepto: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  fecha_creacion?: Date;
  fecha_limite?: Date;
  fecha_completado?: Date;
  ejecutivo_id?: string | null;
  creado_por: string;
  observaciones?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface TicketCreationAttributes extends Omit<TicketAttributes, 'id' | 'fecha_creacion' | 'created_at' | 'updated_at'> {}

class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  public id!: number;
  public asunto!: string;
  public concepto!: string;
  public estado!: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado';
  public prioridad!: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  public fecha_creacion!: Date;
  public fecha_limite?: Date;
  public fecha_completado?: Date;
  public ejecutivo_id?: string | null;
  public creado_por!: string;
  public observaciones?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'ID'
    },
    asunto: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'ASUNTO'
    },
    concepto: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'CONCEPTO'
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'En Proceso', 'Completado', 'Cancelado'),
      allowNull: false,
      defaultValue: 'Pendiente',
      field: 'ESTADO'
    },
    prioridad: {
      type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Crítica'),
      allowNull: false,
      defaultValue: 'Media',
      field: 'PRIORIDAD'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'FECHA_CREACION'
    },
    fecha_limite: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'FECHA_LIMITE'
    },
    fecha_completado: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'FECHA_COMPLETADO'
    },
    ejecutivo_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      field: 'EJECUTIVO_ID'
    },
    creado_por: {
      type: DataTypes.STRING(36),
      allowNull: false,
      field: 'CREADO_POR'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'OBSERVACIONES'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CREATED_AT'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'UPDATED_AT'
    }
  },
  {
    sequelize,
    tableName: 'TICKETS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['estado']
      },
      {
        fields: ['prioridad']
      },
      {
        fields: ['ejecutivo_id']
      },
      {
        fields: ['fecha_creacion']
      }
    ]
  }
);

export default Ticket;
