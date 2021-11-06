'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subcategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subcategory.belongsTo(models.Category, {
        foreignKey: 'category',
        onDelete: 'CASCADE'
      })
    }
  };
  Subcategory.init({
    name: { 
      allowNull: false, 
      type: DataTypes.STRING 
    },
    category: { 
      allowNull: false,
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'Subcategory',
    timestamps: false
  });
  return Subcategory;
};