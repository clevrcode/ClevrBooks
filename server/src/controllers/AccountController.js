const { Account, Category, Subcategory, Entry } = require('../models')

module.exports = {
    async getAllAccounts (req, res) {
        try {
            const accounts = await Account.findAll({
                where: {
                    userId: req.userData.userId
                },
                order: [
                    ['name']
                ]
            })
            if (!accounts) {
                res.send({ message: 'No accounts found' })
            } else {
                // console.log(accounts)
                res.send(accounts)
            }
        } catch (error) {
            res.status(500).send({
                error: error 
            })
        }
    },

    async getAllCategories (req, res) {
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
                error: error 
            })
        }
    },


    async getAccountEntries (req, res) {
        // First make sure the requested account belongs to the user
        try {
            const acc = await Account.findOne({
                where: {
                    id: req.account.id,
                    userId: req.userData.userId
                }
            })
            if (!acc) {
                console.error(`Account '${req.account.id}' doesn't belong to user: ${req.userData.userId}!'`)
                res.status(401).send({
                    error: 'No Permission'
                })
                return
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                error: error 
            })
            return
        }

        console.log('Account: ' + req.account.id)
        console.log('Query: ' + req.query.order + ',' + req.query.limit)
        let sortOrder = 'ASC'
        if (req.query.order && req.query.order === 'DESC') {
            sortOrder = req.query.order
        }
        const query = {
            where: {
                accountId: req.account.id
            },
            order: [
                ['date', sortOrder ]
            ]
        }

        if (req.query.limit > 0) {
            query.limit = req.query.limit
        }
        console.log(query)

        try {
            const entries = await Entry.findAll(query)
            if (!entries) {
                res.send({ message: 'No entries found' })
            } else {
                console.log('Retrieved ' + entries.length + ' entries')
                res.send(entries)
            }
        } catch (error) {
            res.status(500).send({
                error: error 
            })
        }
    },

    async insertEntry (req, res) {

    },

    async addAccount (req, res) {

    },

    async deleteAccount (req, res) {

    },

    async reconcileAccount (req, res) {
        //???
    }
}
