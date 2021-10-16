const bcrypt = require('bcrypt')
const { User } = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

module.exports = {
    async register (req, res) {
        console.log(req.body)
        try {
            const saltRounds = 10
            const hash = bcrypt.hashSync(req.body.password, saltRounds);
            // Store hash in the user object
            const user = await User.create({ email: req.body.email, 
                                             password: hash 
            })
            res.send(user.toJSON())
        } catch (err) {
            console.error('Failed to create user')
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
                    config.JWT.key,
                    { 
                        expiresIn: config.JWT.expiresIn
                    })
                    res.status(200).json({
                        message: 'Authentication successful',
                        token: token
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
