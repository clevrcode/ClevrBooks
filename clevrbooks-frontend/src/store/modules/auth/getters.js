export default {
  userId(state) {
    return state.userId
  },
  token(state) {
    return state.token
  },
  isAuthenticated(state) {
    // console.log(state.token)
    return !!state.token
  },
  apiUrl(state) {
    return state.apiUrl
  },
  signupUrl(state) {
    return state.apiUrl + 'register'
  },
  loginUrl(state) {
    return state.apiUrl + 'login'
  },
  didAutoLogout(state) {
    return state.didAutoLogout
  },
}
