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

const seedfile = path.resolve('../doc/test.csv')
//const seedfile = path.resolve('../doc/BanqueNationale.csv')

// console.log(convertAmount('"-1,234.56"'))
// console.log(convertAmount('123.45'))

getUserId('vaillancourt.c@gmail.com', parseCsvFile)
console.log(`Environment : ${process.env.NODE_ENV}`)
console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=')
//parseCsvFile(seedfile, UserId)
//process.exit()

function parseCsvFile(file, user) {
    console.log(`Open ${file} for user: ${user}...`)   
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
                    insert(items.groups, user)
                }
            })
        }
    })
}

async function getUserId(email, cb) {
    let userId = -1
    try {
        const user = await User.findOne({
            where: { email: email }
        })
        if (user) {
            console.log(`User ${email} found! => ID: ${user.id}`)
            cb(seedfile, user.id)
        } else { 
            console.log(`User ${email} not found!`)
        }
    } catch (err) {
        console.error(err)
    }
    return userId
}

async function insert(data, user) {
    if (data.category.startsWith('[')) {
        // Check if an account needs to be added
        const account_name = /\[(?<account_name>.*)\]/.exec(data.category).groups.account_name
        if (account_name) {
            try {
                console.log(account_name)
                const account = await Account.findOne({
                        where: { name: account_name,  userId: user }
                })
                if (account) {
                    console.log("Account already defined")
                } else {
                    await Account.create({
                        name: account_name,
                        description: account_name, 
                        userId: user
                    })
                }
            } catch (err) {
                console.error('Failed to create account' + err)
            }
        }
    }

    // Insert a new entry
    try {
        await Entry.create({
            date: data.date,
            checkNumber: 100,
            type: '',
            payee: data.payee,
            memo: data.memo,
            category: data.category,
            xferToAccount: false,
            cleared: data.cleared === 'R',
            amount: convertAmount(data.amount),
            accountId: 3
        })    
    } catch (err) {
        console.error('Failed to create entry ' + err)
    }
}

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