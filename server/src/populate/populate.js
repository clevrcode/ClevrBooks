'use strict';
const result = require('dotenv').config()
if (result.error) {
    console.log("Error: Failed to load environment variables...")
    process.exit()
}
console.log('environment loaded')
console.log('NODE_ENV: ' + process.env.NODE_ENV)

const fs = require('fs')
const path = require('path')
const sequelize = require('sequelize')
const { User, Account, Entry, Category, Subcategory } = require('../models');
const subcategory = require('../models/subcategory');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

function convertAmount(amount) {
    if (amount.startsWith('"')) {
        amount = amount.replace(/,/g, '')
        amount = /"(?<amnt>.*)"/.exec(str_amount).groups.amnt
    }
    return parseFloat(amount)
}

// console.log(convertAmount('"-1,234.56"'))
// console.log(convertAmount('123.45'))
const fetchUser = async (username) => {
    return User.findOne({
        where: { email: username }
    })
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

const csvFiles = [
    "ArgentCash.csv", 
    "BanqueNationaleCELI.csv", 
    "BanqueNationale.csv", 
    "BanqueNationaleMargeDeCredit.csv",
    "BanqueNationaleSaving.csv", 
    "CV_Consultant.csv", 
    "Desjardins.csv", 
    "DesjardinsMargeDeCredit.csv",
    "DesjardinsTaxe.csv", 
    // "Home_811TK.csv", 
    // "HondaCivic.csv", 
    "MasterCard.csv", 
    // "Retraite_L3.csv", 
    "TangerineCELI.csv",
    "Tangerine.csv", 
    "TangerineKickstart.csv", 
    "TPS_TVQ.csv", 
    "VISA.csv"
]

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
    console.log('exiting')
}

const insertEntry = async (data) => {
    const amount = data.amount
    Entry.create(data)
    .then(
        entry => {
            console.log(`Created new entry for '${entry.payee}'`)
            return Account.increment('currentBalance', { by: amount, where: { id: data.accountId }})
        }
    )
    .then(
        ret => {
            console.log(`Account ${data.payee} incremented successfully`)
            console.log(ret)
            // if (data.xferToAccount) {
            //     // Create the corresponding entry in the account transfered to...
            //     let xdata = data
            //     xdata.accountId = data.category
            //     xdata.amount = -data.amount
            //     xdata.checkNumber = null
            //     xdata.type = null
            //     xdata.category = data.accountId
            //     console.log('Create cross-entry for ' + xdata)
            //     return Entry.create(xdata)
            // }
        }
    )
    // .then(
    //     entry => {
    //         if (entry) {
    //             console.log(`Cross-Entry created for '${data.payee}'`)
    //             console.log(entry)
    //             return Account.increment('currentBalance', { by: entry.amount, where: { id: entry.accountId }})
    //         }
    //     }
    // )
    // .then(
    //     account => {
    //         if (account) {
    //             console.log(`Account incremented successfully`)
    //             console.log(`Entry entered successfully!!!`)
    //         }
    //     }
    // )
    .catch(
        error => {
            console.error(error)
        }        
    )
}

const insertCategory = async (data) => {
    Category.create({ name: data.name, type: data.type })
    .then(
        category => {
            console.log(`Created new category for '${category.name}'`)
            data.subcategories.forEach((subcat) => {
                Subcategory.create({ name: subcat, category: category.id })
                .then((sub) => {
                    console.log(`Subcategory '${sub.name}' created with id: ${sub.id}' `)
                })
            })
        }
    )
    .catch( (error) => {
        console.log(error)
    })
}

const insertAccount = async (acct) => {
    try {
        const user = await fetchUser(acct.user)
        if (user) {
            console.log('Create acount for user ' + user)
            Account.create({ name: acct.name, 
                description: acct.description,
                initBalance: acct.initBalance,
                currentbalance: acct.currentbalance,
                currency: acct.currentbalance,
                userId: user.id })
            .then(
                account => {
                    console.log(`Account for '${account.name}' created successfully'`)
                }
            )
            .catch (error => {
                console.error(error)
            }) 
        
        } else {
            console.log(`Couldn't found ${acct.user}`)
        }
    } catch (error) {
        console.log(error)
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

//parseCsvFile(seedfile, UserId)
//process.exit() <=== ???? Do not call exit, it prevents all async methods from execute.

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

