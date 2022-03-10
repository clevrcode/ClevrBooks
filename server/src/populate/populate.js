'use strict';
const result = require('dotenv').config()
if (result.error) {
    console.log("Error: Failed to load environment variables...")
    process.exit()
}
console.log('environment loaded')
console.log('NODE_ENV: ' + process.env.NODE_ENV)

const fs = require('fs')
const { User, Account, Entry, Category, Subcategory } = require('../models');

// console.log(convertAmount('"-1,234.56"'))
// console.log(convertAmount('123.45'))
function convertAmount(amount) {
    if (amount.startsWith('"')) {
        amount = amount.replace(/,/g, '')
        amount = /"(?<amnt>.*)"/.exec(str_amount).groups.amnt
    }
    return parseFloat(amount)
}

const AccountAliases = {
    "B. Nat . saving": "BNC Saving",
    "B. Nationale": "BNC Cheque",
    "CELI Banque Nationale": "BNC CELI",
    "ING Direct": "Tangerine",
    "ING - TFSA": "Tangerine CELI",
    "Epargne KickStart": "Tangerine KickStart",
    "Credit Desjardins": "Desjardins Credit",
    "*Taxe de vente*": "TPS-TVQ",
    "Streetwise Balanced Income Fund": "Tangerine Streetwise"
}

const csvFiles = {
    user: 'vaillancourt.c@gmail.com',
    files: [
        "test.csv",
        // "ArgentCash.csv", 
        // "BanqueNationaleCELI.csv", 
        // "BanqueNationale.csv", 
        // "BanqueNationaleMargeDeCredit.csv",
        // "BanqueNationaleSaving.csv", 
        // "CV_Consultant.csv", 
        // "Desjardins.csv", 
        // "DesjardinsMargeDeCredit.csv",
        // "DesjardinsTaxe.csv", 
        // // "Home_811TK.csv", 
        // // "HondaCivic.csv", 
        // "MasterCard.csv", 
        // // "Retraite_L3.csv", 
        // "TangerineCELI.csv",
        // "Tangerine.csv", 
        // "TangerineKickstart.csv", 
        // "TPS_TVQ.csv", 
        // "VISA.csv"
    ]
}

async function connectAndAuthenticate () {
    try {
        console.log('Connect to database...')
        await User.sequelize.authenticate();
        console.log('Connection has been established successfully.');
        return true
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false
    }
}

const insertEntry = async (data) => {
    try {
        const entry = await Entry.create(data)
        // console.log(`Created new entry for '${data.account}'`)
        await Account.increment('currentBalance', { by: data.amount, where: { id: data.accountId }})
        // console.log(`Account ${data.account} incremented successfully`)
    } catch (error) {
        console.error(error)
    }
}

const insertSubCategory = async (id, subcat) => {
    try {
        const sub = await Subcategory.create({ name: subcat, category: id })
        console.log(`Subcategory '${sub.name}' created with id: ${sub.id}' `)
    } catch (error) {
        console.log(error)
    }
}

const insertCategory = async (data) => {
    try {
        const category = await Category.create({ name: data.name, type: data.type })
        console.log(`Created new category for '${category.name}'`)
        data.subcategories.forEach((subcat) => {
            insertSubCategory(category.id, subcat)
        })
    } catch (error) {
        console.log(error)
    }
}

const renameAccount = (name) => {
    let accName = name
    if (name.startsWith('[')) {
        accName = name.substring(1, name.length - 1)
    }
    if (accName in AccountAliases) {
       accName = AccountAliases[accName]
    }
    if (name.startsWith('[')) {
        accName = '[' + accName + ']'
    }
    return accName
}

const insertAccount = async (acct) => {
    try {
        const user = await User.findOne({ where: { email: acct.user } })
        if (user) {
            console.log('Create acount for user ' + user)
            const account = await Account.create({ name: acct.name, 
                description: acct.description,
                initBalance: acct.initBalance,
                currentbalance: acct.currentbalance,
                currency: acct.currency,
                userId: user.id })
            console.log(`Account for '${account.name}' created successfully'`)      
        } else {
            console.log(`Couldn't found user: ${acct.user}`)
        }
    } catch (error) {
        console.log(error)
    }
}

function renameType(type) {
    if (type) {
        let newType = type
        if (newType === 'GAB') {
            newType = 'ATM'
        } else {
            if (newType.indexOf(' ') >= 3) {
                newType = newType.substring(0, newType.indexOf(' '))
            } 
            if (newType.endsWith('.')) {
                newType = newType.substring(0, newType.length - 1)
            }
        }
        return newType
    }
    return type
}

//==========================================================
// Show environment

console.log(`Environment : ${process.env.NODE_ENV}`)
console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=')

//==========================================================
// Populate User table
// run seeder to populate users
// >sequelize db:seed:all
// >sequelize db:seed:undo to empty table

//==========================================================
// Populate Categories/Subcategories tables

var data = require('../../../doc/categories.json');

data.forEach((item) => {
    insertCategory(item)
})

var accts = require('../../../doc/accounts.json');
accts.forEach((acct) => {
    insertAccount(acct)
})

//==========================================================
// Populate Entries tables

csvFiles.files.forEach((file) => {
    parseCsvFile('../doc/data/' + file, csvFiles.user)
})

//parseCsvFile(seedfile, UserId)
//process.exit() <=== ???? Do not call exit, it prevents all async methods from execute.

async function processEntry(entry, userId) {
    try {
        const account = await Account.findOne({ where: { name: entry.account, userId: userId } })
        let category = null
        let subcategory = null
        if (entry.xferToAccount) {
            const name = entry.category.substring(1, entry.category.length - 1)
            const acc = await Account.findOne({ where: { name: name, userId: userId } })
            category = acc.id
        } else {
            const names = entry.category.split(':')
            const cat = await Category.findOne({ where: { name: names[0] } })
            category = cat.id
            if (names.length > 1) {
                const subcat = await Subcategory.findOne({ where: { name: names[1], category: cat.id }})
                subcategory = subcat ? subcat.id : null
            }
        }

        if (account && category) {
            console.log(`insert entry in account '${account.name}'`)
            entry.accountId = account.id
            entry.category = category
            entry.subcategory = subcategory
            insertEntry(entry)
        } else {
            console.log(`Account '${entry.account}' not found!`)
        }
    } catch (err) {
        (err) => console.log(err)
    }
}

async function parseCsvFile(file, userEmail) {
    try {
        const user = await User.findOne({ where: { email: userEmail } })
        if (!user) {
            console.log('User not found: ' + userEmail)
            return
        }
        console.log(`Open ${file} for user id : ${user.id} ...`)
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.error(err)
            } else {
                let lineno = 0
                let linecount = 0
                let balance = 0.0
                let entry = null
                let deferred_entry = null
                let defer = false
                const re = new RegExp(',(?<date>\\d\\d\\d\\d-[01]\\d-[0123]\\d),(?<account>[^,]+),(?<check>[^,]*),(?<payee>[^,]+),(?<memo>[^,]*),(?<category>[^,]+),(?<tag>[^,]*),(?<cleared>[R]*),(?<amount>[0-9\-.]+),')
                const re2 = new RegExp(',,,,,(?<memo>[^,]*),(?<category>[^,]*),(?<tag>[^,]*),(?<cleared>[R]*),(?<amount>[0-9\-.]+),')
                const lines = data.split('\n')
                lines.forEach( line => {
                    lineno++
                    const items = re.exec(line)
                    if (items) {
                        linecount++
                        // console.log(line)
                        //console.log(convertAmount(items.groups.amount).toFixed(2))
                        if (defer && deferred_entry) {
                            console.log(`Process deferred entry: ${deferred_entry.payee}, ${deferred_entry.amount}`)
                            processEntry(deferred_entry, user.id)
                        }
                        balance += convertAmount(items.groups.amount)
                        const checkNumber = isNaN(parseInt(items.groups.check)) ? null : parseInt(items.groups.check)
                        defer = !checkNumber && (items.groups.check && (items.groups.check.length > 10) && (items.groups.check.endsWith('S')))
                        const type = renameType((checkNumber === null) ? items.groups.check : null)
                        const accountName = renameAccount(items.groups.account)
                        const categoryName = renameAccount(items.groups.category)
                        const xferToAccount = categoryName.startsWith('[')
                        // if (checkNumber) {
                        //     console.log(`Check #${checkNumber}`)
                        // } else if (type) {
                        //     console.log(`type: ${type}`)
                        // } else {
                        //     console.log('Missing type or check# :' + line)
                        // }
                        entry = {
                            account: accountName,
                            date: items.groups.date,
                            checkNumber: checkNumber,
                            type: type,
                            payee: items.groups.payee,
                            memo: items.groups.memo,
                            category: categoryName,
                            xferToAccount: xferToAccount,
                            cleared: items.groups.cleared === 'R',
                            amount: convertAmount(items.groups.amount),       
                        }
                        if (!defer) {
                            console.log(`process entry: ${line}`)
                            processEntry(entry, user.id)
                        } else {
                            deferred_entry = entry
                            console.log(`Defer entry: ${line}`)
                        }
                    } else if (defer && deferred_entry) {
                        const subitms = re2.exec(line)
                        if (subitms) {
                            linecount++
                            //console.log(convertAmount(subitms.groups.amount).toFixed(2))
                            const amnt = convertAmount(subitms.groups.amount)
                            balance += amnt
                            deferred_entry.amount += amnt
                            console.log(">>>> " + line)
                        }
                    } else {
                        console.log(`Failed to parse line [${lineno}]: ${line}`)
                    }
                })
                console.log(`Processed ${linecount} lines`)
                console.log(`Ending Balance: ${balance.toFixed(2)}`)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

