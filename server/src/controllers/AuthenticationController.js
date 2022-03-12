const bcrypt = require('bcrypt')
const { User } = require('../models')
const jwt = require('jsonwebtoken')

const result = require('dotenv').config()
if (result.error) {
    console.log("Error: Failed to load environment variables...")
    process.exit()
}
// console.log('environment loaded')
// console.log('NODE_ENV: ' + process.env.NODE_ENV)
const jwtkey = process.env.JWT_SECRET
const jwtexpires = parseInt(process.env.JWT_EXPIRES)

module.exports = {
    async authenticate () {
        try {
            await User.sequelize.authenticate();
            console.log('Connection has been established successfully.');
            return true
          } catch (error) {
            console.error('Unable to connect to the database:', error);
            return false
          }        
    },

    async register (req, res) {
        console.log(req.body)
        try {
            const saltRounds = 10
            const hash = bcrypt.hashSync(req.body.password, saltRounds);
            console.log(hash)
            // Store hash in the user object
            const user = await User.create({ name: req.body.name,
                                             email: req.body.email, 
                                             password: hash
            })
            res.send(user.toJSON())
        } catch (err) {
            console.error('Failed to create user' + err)
            res.status(400).send({
                error: err
            })
        }
    },

    async login (req, res) {
        console.log(req.body)
        try {
            const user = await User.findOne({
                where: {
                    email: req.body.email
                }
            })
            if (!user) {
                console.error(`user '${req.body.email}' not found!'`)
                res.status(401).send({
                    error: 'Invalid user'
                })
            } else {
                console.log('Validate password...')
                const match = await bcrypt.compare(req.body.password, user.password)
                if (match) {
                    console.log("Password is valid!")
                    // Create a JSON Web Token JWT
                    const token = jwt.sign({
                        email: user.email,
                        userId: user.id
                    }, 
                    jwtkey,
                    { 
                        expiresIn: jwtexpires
                    })
                    res.status(200).json({
                        message: 'Authentication successful',
                        userId: user.id,
                        name: user.name,
                        token: token,
                        expiresIn: jwtexpires
                    })
                } else {
                    console.error('Invalid password!')
                    res.status(401).send({
                        error: 'Invalid user'
                    })    
                }
            }
        } catch (err) {
            console.error('Authentication failed')
            res.status(500).send({
                error: err
            })
        }
    }
}
