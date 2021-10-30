const result = require('dotenv').config()
if (result.error) {
    console.log("Error: Failed to load environment variables...")
    process.exit()
}

const fs = require('fs')
const path = require('path')
const sequelize = require('sequelize')
const { User, Account, Entry } = require('./models')
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];

const seedfile = path.resolve('../doc/testone.csv')
//const seedfile = path.resolve('../doc/BanqueNationale.csv')

function convertAmount(amount) {
    let str_amount = amount
    console.log(str_amount)
    if (amount.startsWith('"')) {
        str_amount = amount.replace(/,/g, '')
        console.log(str_amount)
        str_amount = /"(?<amnt>.*)"/.exec(str_amount).groups.amnt
        console.log(str_amount)
    }
    return parseFloat(str_amount)
}

// console.log(convertAmount('"-1,234.56"'))
// console.log(convertAmount('123.45'))
const fetchUser = (username) => {
    return User.findOne({
        where: { email: username }
    })
}

// const fetchAccount = (accountname) => {
//     return Account.findOrCreate({
//         where: { name: accountname },
//         defaults: {
//             description: accountname
//         }
//     })
// }

const insertEntry = async (data) => {
    const amount = data.amount
    Entry.create(data)
    .then(
        entry => {
            console.log(`Create new entry for '${entry.payee}'`)
            return Account.increment('currentBalance', { by: amount, where: { id: data.accountId }})
        }
    )
    .then(
        ret => {
            console.log(`Account ${data.payee} incremented successfully`)
            if (data.xferToAccount) {
                // Create the corresponding entry in the account transfered to...
                let xdata = data
                xdata.accountId = data.category
                xdata.amount = -data.amount
                xdata.checkNumber = null
                xdata.type = null
                xdata.category = data.accountId
                return Entry.create(xdata)
            }
        }
    )
    .then(
        entry => {
            console.log(`Cross-Entry created for for '${data.payee}'`)
            return Account.increment('currentBalance', { by: entry.amount, where: { id: entry.accountId }})
        }
    )
    .then(
        account => {
            console.log(`Account incremented successfully`)
            console.log(`Entry entered successfully!!!`)
        }
    )
    .catch(
        error => {
            console.error(error)
        }        
    )
}

const username = 'vaillancourt.c@gmail.com'

fetchUser(username)
.then(
    user => {
        if (user) {
            parseCsvFile(seedfile, user.id)
        } else {
            console.log(`>>User not found ${username}`)
        }
    }
).catch( (err) => {
    console.error(`User not found ${username}`)
})

console.log(`Environment : ${process.env.NODE_ENV}`)
console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=')
//parseCsvFile(seedfile, UserId)
//process.exit()

function parseCsvFile(file, userId) {
    console.log(`Open ${file} for user id : ${userId}...`)   
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
        } else {
            const re = new RegExp(',(?<date>\\d\\d\\d\\d-[01]\\d-[0123]\\d),(?<account>[^,]+),(?<check>[^,]*),(?<payee>[^,]+),(?<memo>[^,]*),(?<category>[^,]+),,(?<cleared>[R]*),(?<amount>.+)')
            const lines = data.split('\n')
            lines.forEach( line => {
                console.log(line)
                const items = re.exec(line)
                if (items) {
                    console.log(`find or create account ${items.groups.account}`)
                    Account.findOrCreate({
                        where: { name: items.groups.account },
                        defaults: {
                            description: items.groups.account,
                            userId: userId
                        }
                    })
                    .then(
                        account => {
                            console.log(`insert entry in account '${account[0].name}'`)
                            console.log(`account '${account[0].name}' was${ account[1] ? ' ' : ' not '}created`)
                            const checkNumber = isNaN(parseInt(items.groups.check)) ? null : parseInt(items.groups.check)
                            const type = checkNumber === null ? items.groups.check : null
                            insertEntry({
                                date: items.groups.date,
                                checkNumber: checkNumber,
                                type: type,
                                payee: items.groups.payee,
                                memo: items.groups.memo,
                                category: items.groups.category,
                                xferToAccount: items.groups.category.startsWith('['),
                                cleared: items.groups.cleared === 'R',
                                amount: convertAmount(items.groups.amount),
                                accountId: account[0].id
                            })
                        }
                    ).catch(
                        (err) => console.log('fetchAccount error! ' + err)
                    )
                }
            })
        }
    })
}


// async function getUserId(email, cb) {
//     let userId = -1
//     try {
//         const user = await User.findOne({
//             where: { email: email }
//         })
//         if (user) {
//             console.log(`User ${email} found! => ID: ${user.id}`)
//             cb(seedfile, user.id)
//         } else { 
//             console.log(`User ${email} not found!`)
//         }
//     } catch (err) {
//         console.error(err)
//     }
//     return userId
// }

async function insert(data, userId) {
    if (data.category.startsWith('[')) {
        // Check if an account needs to be added
        const account_name = /\[(?<account_name>.*)\]/.exec(data.category).groups.account_name
        if (account_name) {
            try {
                console.log(account_name)
                const account = await Account.findOne({
                        where: { name: account_name,  userId: userId }
                })
                if (account) {
                    console.log("Account already defined")
                } else {
                    await Account.create({
                        name: account_name,
                        description: account_name, 
                        userId: userId
                    })
                }
            } catch (err) {
                console.error('Failed to create account' + err)
            }
        }
    }

}

