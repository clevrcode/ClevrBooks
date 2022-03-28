export default {
    accounts(state) {
        // console.log('getters.accounts')
        return state.accounts
    },
    
    hasAccounts(state) {
        return state.accounts && state.accounts.length > 0
    },
    
    getAccountById: (state) => (id) => {
        // console.log(`getAccountById(${id})`)
        return state.accounts.find(acc => acc.id === id)
    },

    getCategoryById: (state) => (id) => {
        return state.categories[id]
    },

    getSubcategoryById: (state) => (id) => {
        // console.log(`getSubcategoryById(${id})`)
        return state.subcategories[id]
    },

    entries(state) {
        return state.entries
    },

    hasEntries(state) {
        return state.entries && state.entries.length > 0
    },

    getCurrentAccountName(state) {
        if (state.currentAccount) {
            console.log('current account: ' + typeof state.currentAccount)
            const account = state.accounts.find(acc => acc.id === state.currentAccount)
            return account ? account.name : 'Unknown'
        }
        return ''
    }
}