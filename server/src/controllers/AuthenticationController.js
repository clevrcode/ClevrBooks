const bcrypt = require('bcrypt')
const { User } = require('../models')

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
            const {email, password} = req.body
            const user = await User.findOne({
                where: {
                    email: email
                }
            })
            if (!user) {
                console.error(`user '${email}' not found!'`)
                res.status(403).send({
                    error: 'Invalid user'
                })
            } else {
                console.log('Validate password...')
                const match = await bcrypt.compare(password, user.password)
                if (match) {
                    console.log("Password is valid!")
                    res.send(user.toJSON())
                } else {
                    console.error('Invalid password!')
                    res.status(403).send({
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
