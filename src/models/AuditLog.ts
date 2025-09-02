import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const AuditLog = authSequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: "CGBRITO.USERS",
        key: "ID",
      },
    },
    action_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resource_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    resource_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    schema: "CGBRITO",
    tableName: "AUDIT_LOGS",
    timestamps: true,
    createdAt: "CREATED_AT",
    updatedAt: false,
  }
);

export default AuditLog; 