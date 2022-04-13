export default {
  setAccounts(state, payload) {
    state.accounts = payload
  },
  setEntries(state, payload) {
    state.currentAccount = parseInt(payload.accountId)
    state.entries = payload.entries
    state.nextCheckNumber = payload.nextCheck
  },
  appendEntry(state, entry) {
    state.entries.push(entry)
    if (entry.checkNumber) {
      state.nextCheckNumber = entry.checkNumber + 1
    }
  },
  setCategories(state, payload) {
    state.categories = new Array()
    state.subcategories = new Array()
    for (const cat of payload.categories) {
      //   state.categories[cat.id] = { id: cat.id, name: cat.name, type: cat.type }
      state.categories[cat.id] = cat
    }
    for (const subcat of payload.subcategories) {
      state.subcategories[subcat.id] = subcat
    }
  },
  clearAccounts(state) {
    state.accounts = []
    state.categories = {}
    state.subcategories = {}
    state.entries = []
    state.currentAccount = null
  },
  updateAccount(state, payload) {
    const account = state.accounts.find((acc) => acc.id === payload.id)
    if (account) {
      account.currentBalance = payload.currentBalance
    }
  },
}
