export default {
    userId(state) {
        return state.userId
    },
    token(state) {
        return state.token
    },
    isAuthenticated(state) {
        console.log(state.token)
        return !!state.token
    },
    authUrl(state) {
        return state.authUrl
    },
    signupUrl(state) {
        return state.authUrl + 'register'
    },
    loginUrl(state) {
        return state.authUrl + 'login'
    },
    didAutoLogout(state) {
        return state.didAutoLogout
    }    
}