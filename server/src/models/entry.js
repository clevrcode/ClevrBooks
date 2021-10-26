'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Entry extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Entry.belongsTo(models.Account, {
        foreignKey: 'accountId',
        onDelete: 'CASCADE'
      })
    }
  };
  Entry.init({
    date: DataTypes.DATEONLY,
    checkNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: DataTypes.STRING,
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    memo: DataTypes.STRING,
    category: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    xferToAccount: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    cleared: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Entry',
  });
  return Entry;
};