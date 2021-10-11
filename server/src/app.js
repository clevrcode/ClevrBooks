const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

//app.use(morgan('combined'))
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(cors())

app.get('/status', (req, res) => {
    res.send({
        message: 'Hello World!'
    })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Express server started on port ' + port)
})
