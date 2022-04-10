// Set environment variables
const result = require('dotenv').config()
if (result.error) {
  console.log('Error: Failed to load environment variables...')
  process.exit()
}

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const api = require('./api')

const models = require('./models')

// Create the express app object
const app = express()

// Add app middleware
//app.use(morgan('combined'))  // This provides the client user-agent info
app.use(morgan('common'))
app.use(express.json())
app.use(cors())

// Define static routes (later replaced by Vue.js frontend)
require('./routes')(app)

// Define REST API routes
app.use('/api', api)

// Create the database and start the server
const auth = require('./controllers/AuthenticationController')
const authenticated = auth.authenticate()
if (authenticated) {
  const port = process.env.PORT || 8088
  app.listen(port, () => {
    console.log(`Express server started on ${port}`)
  })
}
