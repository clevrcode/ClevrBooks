import mutations from './mutations.js'
import actions from './actions.js'
import getters from './getters.js'

const production_url = 'http://192.168.2.3:8080/api/'
const development_url = 'http://192.168.2.3:8080/api/'
// const development_url = 'http://localhost:8081/api/'

export default {
  state() {
    return {
      token: null,
      userId: null,
      didAutoLogout: false,
      apiUrl:
        process.env.NODE_ENV === 'production'
          ? production_url
          : development_url,
    }
  },
  mutations,
  actions,
  getters,
}
