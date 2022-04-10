const {
  Account,
  Category,
  Subcategory,
  Entry,
  sequelize,
} = require('../models')
const { Op } = require('sequelize')

async function getLastCheckNumber(accountId) {
  const lastCheck = await Entry.findAll({
    where: { checkNumber: { [Op.not]: null }, accountId: accountId },
    order: [['checkNumber', 'DESC']],
    limit: 1,
  })
  if (lastCheck.length > 0) {
    return lastCheck[0].dataValues.checkNumber
  }
  return null
}

async function updateCurrentBalance(accountId, amount) {
  console.log('updateCurrentBalance()')
  console.log(`accountId: ${accountId}: type:${typeof accountId}`)
  console.log(`amount   : ${amount}   : type:${typeof amount}`)
  await Account.increment('currentBalance', {
    by: amount,
    where: { id: accountId },
  })
}

async function updateAccount(account) {
  const entries = await Entry.findAll({
    where: {
      accountId: account.id,
    },
    order: [['date', 'ASC']],
  })
  let balance = account.initBalance
  if (entries.length > 0) {
    entries.forEach((entry) => {
      balance += entry.amount
    })
    await Account.update(
      { currentBalance: balance },
      {
        where: {
          id: account.id,
        },
      },
    )
  }
  account.currentBalance = balance
}

async function modifyEntry(fromEntry, toEntry) {
  // Update the main entry
  if (fromEntry.amount !== toEntry.amount) {
    const amount = toEntry.amount - fromEntry.amount
    updateCurrentBalance(toEntry.accountId, amount)
  }
  let newEntry = {}
  Object.keys(fromEntry).forEach((e) => {
    if (e !== 'id' && fromEntry[e] !== toEntry[e]) {
      console.log(`key=${e}: change ${fromEntry[e]} ==> ${toEntry[e]}`)
      newEntry[e] = toEntry[e]
    }
  })
  await Entry.update(newEntry, {
    where: {
      id: fromEntry.id,
    },
  })
}

async function createEntry(entry) {
  await Entry.create(entry)
  await updateCurrentBalance(entry.accountId, entry.amount)
}

async function deleteEntry(entry) {
  await Entry.destroy({
    where: {
      id: entry.id,
    },
  })
  await updateCurrentBalance(entry.accountId, -entry.amount)
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
        // Update current balance for each account
        console.log(`Found ${accounts.length} accounts`)
        accounts.forEach((account) => {
          updateAccount(account)
          console.log(
            `account updated ${account.name}, balance: ${account.currentBalance}`,
          )
        })
        // send all accounts
        console.log('send accounts...')
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
        // console.log(categories)
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
        const lastCheck = await getLastCheckNumber(req.account.id)
        if (lastCheck) {
          console.log(`last check used: ${lastCheck}`)
          nextCheck = lastCheck + 1
        } else {
          console.log('No check used')
        }
      }
      console.log('get all entries for account')
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
    let mainEntry = req.body
    let xferEntry = null
    if (mainEntry.xferToAccount) {
      xferEntry = JSON.parse(JSON.stringify(mainEntry))
      xferEntry.accountId = mainEntry.category
      xferEntry.category = mainEntry.accountId
      xferEntry.amount = -mainEntry.amount
      xferEntry.checkNumber = null
    }

    try {
      const result = await sequelize.transaction(async (t) => {
        await createEntry(mainEntry)
        if (xferEntry) {
          await createEntry(xferEntry)
        }
      })
      res.send('New entry added')
      console.log('Entry added successfully')
    } catch (error) {
      console.log(`exception: ${error}`)
      res.status(500).send({
        error: error,
      })
    }
  },

  async updateEntry(req, res) {
    console.log('updateEntry()')
    console.log(req.body)
    console.log(req.params)
    let mainEntry = req.body

    try {
      const result = await sequelize.transaction(async (t) => {
        // Get the previous entry
        const beforeEntry = await Entry.findOne({
          where: {
            id: mainEntry.id,
          },
        })
        if (!beforeEntry) {
          console.log('entry not found')
          res.status(401).send({
            error: 'Entry not found!',
          })
          return
        }

        // TODO: TAKE CARE OF POSSIBILITY THAT XFER TO ANOTHER ACCOUNT OR
        //       XFER IS REMOVED AND IS NOW AN EXPENSE
        if (beforeEntry.xferToAccount) {
          let beforeXferEntry = await Entry.findOne({
            where: {
              accountId: beforeEntry.category,
              xferToAccount: 1,
              category: beforeEntry.accountId,
              amount: -beforeEntry.amount,
              payee: beforeEntry.payee,
              date: beforeEntry.date,
            },
          })
          if (!beforeXferEntry) {
            console.log('xfer entry not found')
            res.status(401).send({
              error: 'Transfer entry not found!',
            })
            return
          }

          // Entry changed from xfer to an expense
          if (!mainEntry.xferToAccount) {
            // delete the xfer entry
            deleteEntry(beforeXferEntry)
          } else {
            let xferEntry = JSON.parse(JSON.stringify(mainEntry))
            xferEntry.accountId = mainEntry.category
            xferEntry.category = mainEntry.accountId
            xferEntry.amount = -mainEntry.amount

            // Transfer moved to a different account
            if (mainEntry.category != beforeXferEntry.accountId) {
              // Delete entry and create a new one for the new account
              deleteEntry(beforeXferEntry)
              createEntry(xferEntry)
            } else {
              // Transfer to same account, just modify the transfer entry
              modifyEntry(beforeXferEntry, xferEntry)
            }
          }
        }
        modifyEntry(beforeEntry, mainEntry)
      })
      res.send('Entry updated')
    } catch (error) {
      console.log(`exception: ${error}`)
      res.status(500).send({
        error: `Cannot update entry id ${mainEntry.id}`,
      })
    }
  },

  async deleteEntry(req, res) {},

  async addAccount(req, res) {},

  async deleteAccount(req, res) {},

  async reconcileAccount(req, res) {
    //???
  },
}
