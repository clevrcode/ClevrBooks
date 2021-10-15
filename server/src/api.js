const express = require('express')
const router = express.Router()
const AuthenticationController = require('./controllers/AuthenticationController')

// Log current time middleware
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

// Routes
router.post('/register', 
    AuthenticationController.register
)

router.get('/login', (req, res) => {
    res.send({
        message: 'Login ...'
    })
})

router.get('/status', (req, res) => {
    res.send({
        message: 'Current status ...'
    })
})

router.get('/accounts', (req, res) => {
    res.send({
        messgae: 'All accounts ...'
    })
})

module.exports = router
