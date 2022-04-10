export default {
  setAccounts(state, payload) {
    state.accounts = payload
  },
  setEntries(state, payload) {
    state.currentAccount = parseInt(payload.accountId)
    state.entries = payload.entries
    state.nextCheckNumber = payload.nextCheck
  },
  appendEntry(state, payload) {
    state.entries.push(payload)
    if (payload.checkNumber) {
      state.nextCheckNumber = payload.checkNumber + 1
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
      //   state.subcategories[subcat.id] = {
      //     id: subcat.id,
      //     name: subcat.name,
      //     category: subcat.category,
      //   }
    }
  },
  clearAccounts(state) {
    state.accounts = []
    state.categories = {}
    state.subcategories = {}
    state.entries = []
    state.currentAccount = null
  },
}
