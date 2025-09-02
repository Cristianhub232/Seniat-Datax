'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('menus', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      route: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'menus',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('menus');
  }
};