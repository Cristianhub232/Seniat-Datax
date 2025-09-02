import { DataTypes } from 'sequelize';
import { authSequelize } from '@/lib/db';

const Notification = authSequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: "CGBRITO.USERS",
        key: "ID",
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      defaultValue: 'info',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    schema: "CGBRITO",
    tableName: "NOTIFICATIONS",
    timestamps: true,
    createdAt: "CREATED_AT",
    updatedAt: false,
  }
);

export default Notification; 