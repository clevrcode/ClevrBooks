module.exports = (sequelize, DataTypes) =>
    sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: DataTypes.STRING
    })
