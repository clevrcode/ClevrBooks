'use strict';
const result = require('dotenv').config()
if (result.error) {
    console.log("Error: Failed to load environment variables...")
    process.exit()
}
console.log('environment loaded')
console.log('NODE_ENV: ' + process.env.NODE_ENV)

const fs = require('fs')
const { sequelize, User, Account, Entry, Category, Subcategory } = require('../models');

// console.log(convertAmount('"-1,234.56"'))
// console.log(convertAmount('123.45'))
function convertAmount(amount) {
    if (amount.startsWith('"')) {
        amount = amount.replace(/,/g, '')
        amount = /"(?<amnt>.*)"/.exec(str_amount).groups.amnt
    }
    return parseFloat(amount)
}

const csvFiles = {
    user: 'vaillancourt.c@gmail.com',
    files: [
        "ArgentCash.csv", 
        "BanqueNationaleCELI.csv", 
        "BanqueNationale.csv", 
        "BanqueNationaleMargeDeCredit.csv",
        "BanqueNationaleSaving.csv", 
        //"CV_Consultant.csv", 
        "Desjardins.csv", 
        "DesjardinsMargeDeCredit.csv",
        "DesjardinsTaxe.csv", 
        // "Home_811TK.csv", 
        // "HondaCivic.csv", 
        "MasterCard.csv", 
        // "Retraite_L3.csv", 
        "Tangerine.csv", 
        "TangerineCELI.csv",
        "TangerineKickstart.csv", 
        "TPS_TVQ.csv", 
        "VISA.csv"
    ]
}

let entryCounter = 0
let successEntry = 0
let totalBalance = 0.0
const insertEntry = async (data) => {
    entryCounter++
    try {
        const result = await sequelize.transaction(async (t) => {
            const entry = await Entry.create(data)
            // console.log(`Created new entry for '${data.account}'`)
            await Account.increment('currentBalance', { by: data.amount, where: { id: data.accountId }})
            // console.log(`Account ${data.account} incremented successfully`)
            return entry
        })
        totalBalance += data.amount
        successEntry++
        // console.log(`Entry ${successEntry}/${entryCounter} for ID:${result.id} created: balance: ${totalBalance.toFixed(2)}`)
    } catch (error) {
        console.error(error)
    }
}

const insertSubCategory = async (id, subcat) => {
    try {
        const sub = await Subcategory.create({ name: subcat, category: id })
        // console.log(`Subcategory '${sub.name}' created with id: ${sub.id}' `)
    } catch (error) {
        console.error(error)
    }
}

const insertCategory = async (data) => {
    try {
        const category = await Category.create({ name: data.name, type: data.type })
        // console.log(`Created new category for '${category.name}'`)
        data.subcategories.forEach((subcat) => {
            insertSubCategory(category.id, subcat)
        })
    } catch (error) {
        console.error(error)
    }
}

const insertAccount = async (acct) => {
    try {
        const user = await User.findOne({ where: { email: acct.user } })
        if (user) {
            // console.log(`Create acount for user '${user.name}'`)
            const account = await Account.create({ name: acct.name, 
                description: acct.description,
                initBalance: acct.initBalance,
                currentbalance: acct.currentbalance,
                currency: acct.currency,
                userId: user.id })
            // console.log(`Account for '${account.name}' created successfully'`)      
        } else {
            console.error(`Couldn't found user: ${acct.user}`)
        }
    } catch (error) {
        console.error(error)
    }
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
            if (acc) {
                category = acc.id
            } else {
                console.error(`Category not found: [${name}, userId: ${userId}]`)
                console.log(entry)
            }
        } else {
            const names = entry.category.split(':')
            const cat = await Category.findOne({ where: { name: names[0] } })
            if (cat) {
                category = cat.id
                if (names.length > 1) {
                    const subcat = await Subcategory.findOne({ where: { name: names[1], category: cat.id }})
                    if (subcat) {
                        subcategory = subcat.id
                    } else {
                        console.error(`Subcategory not found: [${names[1]}]`)
                    }
                }
            } else {
                console.error(`Category not found: [${names[0]}]`)
                console.error(entry)
            }
        }
        if (account && category) {
            // console.log(`insert entry in account '${account.name}'`)
            entry.accountId = account.id
            entry.category = category
            entry.subcategory = subcategory
            insertEntry(entry)
        } else {
            if (!account) {
                console.error(`Account '${entry.account}' not found!`)
            }
        }
    } catch (err) {
        console.error(err)
    }
}

async function parseCsvFile(file, userEmail) {
    try {
        const user = await User.findOne({ where: { email: userEmail } })
        if (!user) {
            console.error('User not found: ' + userEmail)
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
                let entryProcessed = 0
                let entry = null
                let deferred_entry = null
                let defer = false
                const re = new RegExp(',(?<date>\\d\\d\\d\\d-[01]\\d-[0123]\\d),(?<account>[^,]+),(?<check>[^,]*),(?<payee>[^,]*),(?<memo>[^,]*),(?<category>[^,]*),(?<tag>[^,]*),(?<cleared>[R]*),(?<amount>[0-9\-.]+),')
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
                            // console.log(`Process deferred entry: ${deferred_entry.payee}, ${deferred_entry.amount}`)
                            // console.log(deferred_entry)
                            entryProcessed++
                            processEntry(deferred_entry, user.id)
                        }
                        const data = items.groups
                        const amount = convertAmount(data.amount)
                        balance += amount
                        const checkNumber = isNaN(parseInt(data.check)) ? null : parseInt(data.check)
                        defer = !checkNumber && (data.check && data.check.endsWith('S'))
                        const type = (checkNumber === null) ? data.check : null
                        const accountName = data.account
                        const categoryName = data.category || "Misc"
                        const xferToAccount = categoryName.startsWith('[')
                        const payee = data.payee || 'Unknown'
                        if ((payee === 'Unknown')&&(amount === 0)) {
                            console.log(`reject entry: ${line}`)
                            return
                        }
                        entry = {
                            account: accountName,
                            date: data.date,
                            checkNumber: checkNumber,
                            type: type,
                            payee: payee,
                            memo: data.memo,
                            category: categoryName,
                            xferToAccount: xferToAccount,
                            cleared: data.cleared === 'R',
                            amount: convertAmount(data.amount),       
                        }
                        if (!defer) {
                            // console.log(`process entry: ${line}`)
                            entryProcessed++
                            processEntry(entry, user.id)
                        } else {
                            deferred_entry = entry
                            // console.log(`Defer entry: ${line}`)
                        }
                    } else if (defer && deferred_entry) {
                        const subitms = re2.exec(line)
                        if (subitms) {
                            linecount++
                            //console.log(convertAmount(subitms.groups.amount).toFixed(2))
                            const amount = convertAmount(subitms.groups.amount)
                            balance += amount
                            deferred_entry.amount += amount
                            // console.log(">>>> " + line)
                        }
                    } else {
                        console.error(`Failed to parse line [${lineno}]: ${line}`)
                    }
                })
                console.log(`Processed ${linecount} lines, ${entryProcessed} entries`)
                console.log(`Ending Balance: ${balance.toFixed(2)}`)
            }
        })
    } catch (error) {
        console.error(error)
    }
}

