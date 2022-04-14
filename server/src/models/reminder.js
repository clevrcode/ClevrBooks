'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Reminder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reminder.belongsTo(models.Account, {
        foreignKey: 'fromAccount',
        onDelete: 'CASCADE',
      })
    }
  }
  Reminder.init(
    {
      payee: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      frequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dow: {
        // Day of week [1-7]
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      day1: {
        // Day of month [1-31]
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      month1: {
        // Month [1-12]
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      day2: {
        // Day of month [1-31]
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      month2: {
        // Month [1-12]
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        // ['upcoming', 'due', 'overdue']
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Reminder',
      timestamps: false,
    },
  )
  return Reminder
}
