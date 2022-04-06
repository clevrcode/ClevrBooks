const { Account, Category, Subcategory, Entry } = require('../models')
const { Op } = require('sequelize')

async function getLastCheckNumber(accountId) {
  const lastCheck = await Entry.findAll({
    where: { checkNumber: { [Op.not]: null }, accountId: accountId },
    order: [['checkNumber', 'DESC']],
    limit: 1,
  })
  if (lastCheck) {
    return lastCheck[0].dataValues.checkNumber
  }
  return null
}

module.exports = {
  async getAllAccounts(req, res) {
    try {
      const accounts = await Account.findAll({
        where: {
          userId: req.userData.userId,
        },
        order: [['name']],
      })
      if (!accounts) {
        res.send({ message: 'No accounts found' })
      } else {
        // console.log(accounts)
        res.send(accounts)
      }
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  },

  async getAllCategories(req, res) {
    try {
      result = {}
      const categories = await Category.findAll()
      if (!categories) {
        res.send({ message: 'No categories found' })
      } else {
        console.log(categories)
        result.categories = categories
        const subcategories = await Subcategory.findAll()
        if (subcategories) {
          result.subcategories = subcategories
        }
        res.send(result)
      }
    } catch (error) {
      res.status(500).send({
        error: error,
      })
    }
  },

  async getAccountEntries(req, res) {
    console.log('Account: ' + req.account.id)
    console.log('Query: ' + req.query.order + ',' + req.query.limit)
    let sortOrder = 'ASC'
    if (req.query.order && req.query.order === 'DESC') {
      sortOrder = req.query.order
    }
    const query = {
      where: {
        accountId: req.account.id,
      },
      order: [['date', sortOrder]],
    }

    if (req.query.limit > 0) {
      query.limit = req.query.limit
    }
    console.log(query)

    try {
      let nextCheck = null
      console.log(`Account type: ${req.account.type}`)
      if (req.account.type === 'Banking') {
        console.log('Check for last check number used...')
        const lastCheck = await getLastCheckNumber(req.account.id)
        if (lastCheck) {
          console.log(`last check used: ${lastCheck}`)
          nextCheck = lastCheck + 1
        } else {
          console.log('No check used')
        }
      }
      const entries = await Entry.findAll(query)
      if (!entries) {
        res.send({ message: 'No entries found' })
      } else {
        console.log('Retrieved ' + entries.length + ' entries')
        response = {
          entries: entries,
          nextCheck: nextCheck,
        }
        res.send(response)
      }
    } catch (error) {
      console.log(`exception: ${error}`)
      res.status(500).send({
        error: error,
      })
    }
  },

  // const request = {
  //     date: transactionDate.value,
  //     payee: payeeInput.value,
  //     memo: memoInput.value,
  //     xferToAccount: xferToAccount.value,
  //     category: category,
  //     subcategory: subcategory,
  //     cleared: false,
  //     amount: (chargeInput.value.length > 0) ? -parseFloat(chargeInput.value) : parseFloat(paymentInput.value)
  // }
  async insertEntry(req, res) {
    console.log('insertEntry()')
    console.log(req.body)
    console.log(req.params)
    let xferEntry = null
    if (req.body.xferToAccount) {
      xferEntry = req.body
    }

    // const entry = await Entry.create({
    //     firstName: "Jane",
    //     lastName: "Doe"
    // })

    res.send('New entry added')
  },

  async updateEntry(req, res) {},

  async deleteEntry(req, res) {},

  async addAccount(req, res) {},

  async deleteAccount(req, res) {},

  async reconcileAccount(req, res) {
    //???
  },
}
