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
    }
}