import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const Permission = authSequelize.define(
  "Permission",
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
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resource_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    action_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    schema: "CGBRITO",
    tableName: "PERMISSIONS",
    timestamps: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
  }
);

export default Permission; 