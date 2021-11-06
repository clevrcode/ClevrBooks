'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      checkNumber: Sequelize.INTEGER,
      type: Sequelize.STRING,
      payee: {
        type: Sequelize.STRING,
        allowNull: false
      },
      memo: Sequelize.STRING,
      category: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      subcategory: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      xferToAccount: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      cleared: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      accountId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Accounts',
          key: 'id',
          as: 'accountId'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Entries');
  }
};