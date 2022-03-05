import mutations from './mutations.js'
import actions from './actions.js'
import getters from './getters.js'

export default {
    state() {
        return {
            token: null,
            userId: null,
            didAutoLogout: false,
            apiUrl: 'http://192.168.2.3:8080/api/'
        }
    },
    mutations,
    actions,
    getters 
}