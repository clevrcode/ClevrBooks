import mutations from './mutations.js'
import actions from './actions.js'
import getters from './getters.js'

// const url = 'http://192.168.2.3:8080/api/'
const url = 'http://localhost:8081/api/'

export default {
    state() {
        return {
            token: null,
            userId: null,
            didAutoLogout: false,
            apiUrl: url
        }
    },
    mutations,
    actions,
    getters 
}