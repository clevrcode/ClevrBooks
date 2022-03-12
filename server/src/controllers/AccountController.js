const { Account, Entry } = require('../models')

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
                console.log(accounts)
                res.send(accounts)
            }
        } catch (error) {
            res.status(500).send({
                error: error 
            })
        }
    },

    async getAccountEntries (req, res) {

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
