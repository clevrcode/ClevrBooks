import mutations from './mutations.js'
import actions from './actions.js'
import getters from './getters.js'

export default {
  namespaced: true,
  state() {
    return {
      accounts: [],
      categories: [],
      subcategories: [],
      entries: [],
      currentAccount: null,
      nextCheckNumber: null,
    }
  },
  mutations,
  actions,
  getters,
}
