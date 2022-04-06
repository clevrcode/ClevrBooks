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
    return state.accounts.find((acc) => acc.id === id)
  },
  getAccountByName: (state) => (name) => {
    return state.accounts.find((acc) => {
      return acc ? acc.name === name : false
    })
  },

  getCategoryById: (state) => (id) => {
    return state.categories[id]
  },

  getCategories(state) {
    console.log(state.categories.length)
    return state.categories
  },

  getCategoryByName: (state) => (name) => {
    return state.categories.find((cat) => {
      return cat ? cat.name === name : false
    })
  },
  getSubcategoryByName: (state) => (name) => {
    return state.subcategories.find((scat) => {
      return scat ? scat.name === name : false
    })
  },

  getSubcategoryById: (state) => (id) => {
    // console.log(`getSubcategoryById(${id})`)
    return state.subcategories[id]
  },

  getCategoryList(state) {
    const catList = []
    console.log(state.categories)
    state?.categories?.forEach((cat) => {
      catList.push(cat.name)
      const subcat = state?.subcategories?.filter(
        (sc) => sc.category === cat.id,
      )
      subcat?.forEach((sc) => catList.push(`${cat.name}:${sc.name}`))
    })
    return catList
  },

  getCategoryName: (state) => (category, subcategory) => {
    // console.log(`${category},${subcategory}`)
    if (subcategory) {
      return `${state.categories[category].name}:${state.subcategories[subcategory].name}`
    }
    return state.categories[category].name
  },

  getEntries(state) {
    return state.entries
  },

  hasEntries(state) {
    return state.entries && state.entries.length > 0
  },

  getCurrentAccountName(state) {
    if (state.currentAccount) {
      // console.log('current account: ' + typeof state.currentAccount)
      const account = state.accounts.find(
        (acc) => acc.id === state.currentAccount,
      )
      return account ? account.name : 'Unknown'
    }
    return ''
  },

  getCurrentAccountType(state) {
    if (state.currentAccount) {
      // console.log('current account: ' + typeof state.currentAccount)
      const account = state.accounts.find(
        (acc) => acc.id === state.currentAccount,
      )
      return account ? account.type : 'Unknown'
    }
    return ''
  },

  getNextCheckNumber(state) {
    return state.nextCheckNumber
  },

  getUniquePayeeList(state) {
    let result = []
    if (state.entries.length > 0) {
      let names = []
      state.entries.forEach((x) => names.push(x.payee))
      result = names.filter((v, i, a) => a.indexOf(v) === i)
      // console.log(result)
    }
    return result
  },

  getLastEntryForPayee: (state) => (payee) => {
    const lastIndex = state.entries
      .map((entry) => entry.payee === payee)
      .lastIndexOf(true)
    return state.entries[lastIndex]
  },
}
