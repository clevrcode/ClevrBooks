const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../config/config')
const db = {}

const connection = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    config.db.options
)

fs.readdirSync(__dirname).filter((file) => file !== 'index.js').forEach((file) => {
    console.log(`Import model from ${file}`)
    const model = require(path.join(__dirname, file))(connection, Sequelize)
    db[model.name] = model
})

db.sequelize = connection
db.Sequelize = Sequelize

module.exports = db
