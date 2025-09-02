import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const Session = authSequelize.define(
  "Session",
  {
    id: {
      type: DataTypes.STRING(36),
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
    token_hash: {
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
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    schema: "CGBRITO",
    tableName: "SESSIONS",
    timestamps: true,
    createdAt: "CREATED_AT",
    updatedAt: false,
  }
);

export default Session; 