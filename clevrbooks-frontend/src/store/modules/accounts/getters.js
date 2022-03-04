export default {
    accounts(state) {
        return state.accounts
    },
    hasAccounts(state) {
        return state.accounts && state.accounts.length > 0
    }
}