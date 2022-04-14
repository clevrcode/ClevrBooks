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
  console.log(lastCheck)
  if (lastCheck.length > 0) {
    return lastCheck[0].checkNumber
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
  const newBalance = await Account.findOne({
    attributes: ['id', 'currentBalance'],
    where: { id: accountId },
  })
  return newBalance
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
  let affectedAccount = null
  if (fromEntry.amount !== toEntry.amount) {
    const amount = toEntry.amount - fromEntry.amount
    affectedAccount = updateCurrentBalance(toEntry.accountId, amount)
  }
  if (toEntry.hasOwnProperty('id')) delete toEntry.id
  if (toEntry.hasOwnProperty('createdAt')) delete toEntry.createdAt
  if (toEntry.hasOwnProperty('updatedAt')) delete toEntry.updatedAt
  await Entry.update(toEntry, {
    where: {
      id: fromEntry.id,
    },
  })
  return affectedAccount
}

async function createEntry(entry) {
  if (entry.hasOwnProperty('id')) delete entry.id
  if (entry.hasOwnProperty('createdAt')) delete entry.createdAt
  if (entry.hasOwnProperty('updatedAt')) delete entry.updatedAt
  await Entry.create(entry)
  const affected = await updateCurrentBalance(entry.accountId, entry.amount)
  if (affected) {
    console.log(
      `Affected account: ${affected.id}, balance: ${affected.CurrentBalance}`,
    )
  }
  return affected
}

async function destroyEntry(entry) {
  await Entry.destroy({
    where: {
      id: entry.id,
    },
  })
  const affected = await updateCurrentBalance(entry.accountId, -entry.amount)
  return affected
}

function buildXferEntry(entry) {
  let xferEntry = null
  if (entry.xferToAccount) {
    xferEntry = JSON.parse(JSON.stringify(entry))
    xferEntry.accountId = entry.category
    xferEntry.category = entry.accountId
    xferEntry.amount = -entry.amount
    xferEntry.checkNumber = null
    if (xferEntry.hasOwnProperty('id')) delete xferEntry.id
    if (xferEntry.hasOwnProperty('createdAt')) delete xferEntry.createdAt
    if (xferEntry.hasOwnProperty('updatedAt')) delete xferEntry.updatedAt
  }
  return xferEntry
}

async function findXferEntry(entry) {
  return await Entry.findOne({
    where: {
      accountId: entry.category,
      xferToAccount: 1,
      category: entry.accountId,
      amount: -entry.amount,
      payee: entry.payee,
      date: entry.date,
    },
  })
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
    let xferEntry = buildXferEntry(mainEntry)

    try {
      let affectedAccounts = []
      const result = await sequelize.transaction(async (t) => {
        let affected = await createEntry(mainEntry)
        if (affected) affectedAccounts.push(affected)
        if (xferEntry) {
          affected = await createEntry(xferEntry)
          if (affected) affectedAccounts.push(affected)
        }
      })
      res.send({
        message: 'New entry added successfully',
        affectedAccounts: affectedAccounts,
      })
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
    let newEntry = req.body
    let affectedAccounts = []
    try {
      const result = await sequelize.transaction(async (t) => {
        // Get the previous entry
        const beforeEntry = await Entry.findOne({
          where: {
            id: newEntry.id,
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
          console.log('entry was previously a xfer to account')
          let beforeXferEntry = await findXferEntry(beforeEntry)
          if (!beforeXferEntry) {
            console.log('xfer entry not found')
            res.status(401).send({
              error: 'Transfer entry not found!',
            })
            return
          }

          // Entry changed from xfer to an expense
          if (!newEntry.xferToAccount) {
            // delete the xfer entry
            let tmp = await destroyEntry(beforeXferEntry)
            if (tmp) affectedAccounts.push(tmp)
          } else {
            // Transfer moved to a different account
            if (newEntry.category != beforeXferEntry.accountId) {
              // Delete entry and create a new one for the new account
              let tmp = await destroyEntry(beforeXferEntry)
              if (tmp) affectedAccounts.push(tmp)
              const xferEntry = buildXferEntry(newEntry)
              tmp = await createEntry(xferEntry)
              if (tmp) affectedAccounts.push(tmp)
            } else {
              // Transfer to same account, just modify the transfer entry
              const xferEntry = buildXferEntry(newEntry)
              let tmp = await modifyEntry(beforeXferEntry, xferEntry)
              if (tmp) affectedAccounts.push(tmp)
            }
          }
        } else if (newEntry.xferToAccount) {
          // create the xfer entry
          const xferEntry = buildXferEntry(newEntry)
          console.log(
            `create new entry for xfer to account: ${xferEntry.accountId}`,
          )
          let tmp = await createEntry(xferEntry)
          if (tmp) affectedAccounts.push(tmp)
        }
        console.log(beforeEntry)
        let tmp = await modifyEntry(beforeEntry, newEntry)
        if (tmp) affectedAccounts.push(tmp)
        console.log(affectedAccounts)
      })
      // Send response to caller
      res.send({
        message: 'Entry updated successfully',
        affectedAccounts: affectedAccounts,
      })
    } catch (error) {
      console.log(`exception: ${error}`)
      res.status(500).send({
        error: `Cannot update entry id ${mainEntry.id}`,
      })
    }
  },

  async deleteEntry(req, res) {
    console.log('deleteEntry()')
    console.log(`Params: ${req.params}`)
    console.log(`Query: ${req.query.entryId}`)
    const entryId = req.query.entryId

    try {
      let affectedAccounts = []
      const result = await sequelize.transaction(async (t) => {
        console.log(`retrieve entry id: ${entryId}`)
        let mainEntry = await Entry.findOne({
          where: {
            id: entryId,
          },
        })
        if (mainEntry) {
          console.log(`entry found: payee is '${mainEntry.payee}'`)
          // let xferEntry = buildXferEntry(mainEntry)
          // if (xferEntry) console.log('xfer entry should exist ...')
          console.log(`delete main entry ${entryId}`)
          let affected = await destroyEntry(mainEntry)
          if (affected) affectedAccounts.push(affected)
          if (mainEntry.xferToAccount) {
            console.log('check for xferEntry...')
            let tmpEntry = await findXferEntry(mainEntry)
            if (tmpEntry) {
              console.log(`xfer entry found... id: ${tmpEntry.id}`)
              affected = await destroyEntry(tmpEntry)
              if (affected) affectedAccounts.push(affected)
            }
          }
        } else {
          res.status(401).send({
            message: `Entry ${req.query.entryId} not found!`,
          })
          return
        }
      })
      res.send({
        message: 'Entry deleted successfully',
        affectedAccounts: affectedAccounts,
      })
      console.log('Entry deleted successfully')
    } catch (error) {
      console.log(`exception: ${error}`)
      res.status(500).send({
        error: error,
      })
    }
  },

  async addAccount(req, res) {},

  async deleteAccount(req, res) {},

  async reconcileAccount(req, res) {
    //???
  },
}
