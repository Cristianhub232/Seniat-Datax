import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const RolePermission = authSequelize.define(
  "RolePermission",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CGBRITO.ROLES",
        key: "ID",
      },
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CGBRITO.PERMISSIONS",
        key: "ID",
      },
    },
  },
  {
    schema: "CGBRITO",
    tableName: "ROLE_PERMISSIONS",
    timestamps: true,
    createdAt: "CREATED_AT",
    updatedAt: false,
  }
);

export default RolePermission; 