const jwt = require('jsonwebtoken')
const result = require('dotenv').config()
if (result.error) {
    console.log("Error: Failed to load environment variables...")
    process.exit()
}
const jwtkey = process.env.JWT_SECRET

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        // console.log("check-auth: " + token)
        const decoded = jwt.verify(token, jwtkey)
        req.userData = decoded
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }
}