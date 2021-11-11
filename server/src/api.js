const express = require('express')
const router = express.Router()
const AuthenticationController = require('./controllers/AuthenticationController')
const AccountController = require('./controllers/AccountController')
const logTime = require('./middleware/log-time')
const checkAuth = require('./middleware/check-auth')


// Log current time middleware
router.use(logTime)

// Routes
router.post('/register', 
    AuthenticationController.register
)

router.post('/login',
    AuthenticationController.login
)

router.get('/status', (req, res) => {
    res.send({
        message: 'Current status ...'
    })
})

router.get('/accounts', 
    checkAuth,    
    AccountController.getAllAccounts
)

router.post('/insert_entry',
    checkAuth,
    AccountController.insertEntry
)

module.exports = router
