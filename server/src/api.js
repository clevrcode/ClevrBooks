const express = require('express')
const router = express.Router()
const AuthenticationController = require('./controllers/AuthenticationController')
const AccountController = require('./controllers/AccountController')
const logTime = require('./middleware/log-time')
const checkAuth = require('./middleware/check-auth')
const validateAccount = require('./middleware/validate-account')

// Log current time middleware
router.use(logTime)

// Routes
router.post('/register', AuthenticationController.register)

router.post('/login', AuthenticationController.login)

router.get('/status', (req, res) => {
  res.send({
    message: 'Current status ...',
  })
})

router.get('/accounts', checkAuth, AccountController.getAllAccounts)

router.get('/categories', checkAuth, AccountController.getAllCategories)

// router.param('accountId', async function (req, res, next, id, name) {
//     // Account validated
//     req.account = {
//         id: id
//     }
//     console.log(`Account param ${name}:${id} validated`)
//     next()
// })

router
  .route('/account/:accountId')
  .get(checkAuth, validateAccount, AccountController.getAccountEntries)
  .post(checkAuth, validateAccount, AccountController.insertEntry)
  .put(checkAuth, AccountController.updateEntry)
  .delete(checkAuth, AccountController.deleteEntry)

module.exports = router
