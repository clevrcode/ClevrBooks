'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      initBalance: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      currentBalance: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      currency: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'CDN'
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId'
        }
      },
      reconciledAt: {
        allowNull: true,
        type: Sequelize.DATEONLY
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Accounts');
  }
};