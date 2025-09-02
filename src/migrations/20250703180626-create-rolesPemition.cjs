'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('role_menu_permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      menu_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'menus',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      can_view: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      can_edit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('role_menu_permissions');
  }
};