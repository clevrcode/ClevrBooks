
module.exports = (app) => {
    const express = require('express')
    const path = require('path')
    app.use('/', express.static(path.join(__dirname, 'public')))
}
