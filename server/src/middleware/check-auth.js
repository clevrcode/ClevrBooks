const jwt = require('jsonwebtoken')
const config = require('../config/dbconfig')
const jwtkey = require(__dirname + '/../config/config.json')["JWT"].key

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        // console.log(token)
        const decoded = jwt.verify(token, jwtkey)
        req.userData = decoded
        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }
}