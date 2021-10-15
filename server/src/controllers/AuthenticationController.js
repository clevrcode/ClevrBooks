const bcrypt = require('bcrypt')
const {User} = require('../models')

module.exports = {
    async register (req, res) {
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
    }
}
