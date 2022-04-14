'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
      }),
        Account.hasMany(models.Entry, {
          foreignKey: 'accountId',
        }),
        Account.hasMany(models.Reminder, {
          foreignKey: 'fromAccount',
        })
    }
  }
  Account.init(
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      description: DataTypes.STRING,
      type: DataTypes.STRING,
      initBalance: {
        allowNull: false,
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      currentBalance: {
        allowNull: false,
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      currency: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: 'CDN',
      },
      reconciledAt: {
        type: DataTypes.DATEONLY,
      },
    },
    {
      sequelize,
      modelName: 'Account',
      timestamps: false,
    },
  )
  return Account
}
