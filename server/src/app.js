const express = require('express')
// bodyParser is now deprecated, just use(express.json()) instead with express 4.16+
//const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const {sequelize} = require('./models') // resolve to ./models/index.js
const config = require('./config/config')
const api = require('./api')

var path = require('./models');
console.log(". = %s", path);
//console.log("__dirname = %s", path.resolve(__dirname));

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
sequelize.sync()
    .then(() => {
        app.listen(config.port, () => {
        console.log(`Express server started on ${config.port}`)
        })
    })
    .catch(() => console.log('Failed to connect database'))
