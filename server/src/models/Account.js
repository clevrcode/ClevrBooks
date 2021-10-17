module.exports = (sequelize, DataTypes) =>
    sequelize.define('Account', {
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        description: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.INTEGER
        },
        initBalance: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
        currentBalance: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        }
    })
