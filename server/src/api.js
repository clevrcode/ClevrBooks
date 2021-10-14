const express = require('express')
const router = express.Router()

// Log current time middleware
router.use((req, res, next) => {
    console.log('Time: ', Date.toDateString())
    next()
})

router.get('/signup', (req, res) => {
    res.send({
        message: 'Signup ...'
    })
})

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
