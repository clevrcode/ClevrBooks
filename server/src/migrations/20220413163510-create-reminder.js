'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reminders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      payee: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      fromAccount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'Accounts',
          key: 'id',
          as: 'fromAaccount',
        },
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      frequency: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      dow: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      day1: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      month1: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      day2: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      month2: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reminders')
  },
}
