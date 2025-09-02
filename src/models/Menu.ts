import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const Menu = authSequelize.define(
  "Menu",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "CGBRITO.MENUS",
        key: "ID",
      },
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },
  {
    schema: "CGBRITO",
    tableName: "MENUS",
    timestamps: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
  }
);

export default Menu;
