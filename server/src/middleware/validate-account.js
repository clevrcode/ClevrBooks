const { Account } = require('../models')

module.exports = async (req, res, next) => {
  try {
    console.log(`validate account: ${req.params.accountId}`)
    const acc = await Account.findOne({
      where: {
        id: req.params.accountId,
        userId: req.userData.userId,
      },
    })
    if (!acc) {
      console.error(
        `Account '${id}' doesn't belong to user: ${req.userData.userId}!'`,
      )
      res.status(401).send({
        error: 'Unauthorized',
      })
      return
    }
    req.account = {
      id: req.params.accountId,
      type: acc.type,
    }
    next()
  } catch (error) {
    console.log(error)
    res.status(500).send({
      error: error,
    })
  }
}
