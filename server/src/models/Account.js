'use strict';
const {
  Model
} = require('sequelize');
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
        onDelete: 'CASCADE'
      }),
      Account.hasMany(models.Transaction, {
        foreignKey: 'accountId'
      })
    }
  };
  Account.init({
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    description: DataTypes.STRING,
    initBalance: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    currentBalance: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'CDN'
    }
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};