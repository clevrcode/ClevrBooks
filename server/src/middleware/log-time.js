module.exports = (req, res, next) => {
    const date = new Date(Date.now())
    console.log('Time: ', date.toLocaleString())
    next()
}