module.exports = (sequelize, DataTypes) =>
sequelize.define('Transaction', {
    date: {
        type: DataTypes.DATEONLY
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    checkNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    memo: {
        type: DataTypes.STRING,
        allowNull: true
    },
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
})
