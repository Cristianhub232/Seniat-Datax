import { Model, DataTypes } from 'sequelize';
import sequelize from '@/lib/db';

export interface TicketHistoryAttributes {
  id?: number;
  ticket_id: number;
  campo_cambiado: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  usuario_id: number;
  fecha_cambio?: Date;
}

export interface TicketHistoryCreationAttributes extends Omit<TicketHistoryAttributes, 'id' | 'fecha_cambio'> {}

class TicketHistory extends Model<TicketHistoryAttributes, TicketHistoryCreationAttributes> implements TicketHistoryAttributes {
  public id!: number;
  public ticket_id!: number;
  public campo_cambiado!: string;
  public valor_anterior?: string;
  public valor_nuevo?: string;
  public usuario_id!: number;
  public fecha_cambio!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TicketHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'ID'
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'TICKET_ID',
      references: {
        model: 'TICKETS',
        key: 'ID'
      }
    },
    campo_cambiado: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'CAMPO_CAMBIADO'
    },
    valor_anterior: {
      type: DataTypes.STRING(4000),
      allowNull: true,
      field: 'VALOR_ANTERIOR'
    },
    valor_nuevo: {
      type: DataTypes.STRING(4000),
      allowNull: true,
      field: 'VALOR_NUEVO'
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USUARIO_ID'
    },
    fecha_cambio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'FECHA_CAMBIO'
    }
  },
  {
    sequelize,
    tableName: 'TICKET_HISTORY',
    timestamps: false,
    indexes: [
      {
        fields: ['ticket_id']
      }
    ]
  }
);

export default TicketHistory;
