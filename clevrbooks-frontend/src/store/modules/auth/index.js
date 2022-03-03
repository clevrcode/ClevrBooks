let timer

export default {
    state() {
        return {
            token: null,
            userId: null,
            didAutoLogout: false,
            authUrl: 'http://192.168.2.3:8080/api/',
            firebaseUrl: '',
            API_KEY: 'AIzaSyBujHkX5m_Tjl5jWcEc_vT0e8XRNc-dtlA'
        }
    },
    mutations: {
        setUser(state, payload) {
            state.token = payload.token
            state.userId = payload.userId
            state.didAutoLogout = false
        },
        setAutoLogout(state) {
            state.didAutoLogout = true
        }    
    },
    actions: {
        async login(context, payload) {
            // FIXME: does return needed here???
            return context.dispatch('auth', {
                data: payload,
                mode: 'login'
            })
        },
        async signup(context, payload) {
            // FIXME: does return needed here???
            return context.dispatch('auth', {
                data: payload,
                mode: 'signup'
            })
        },
        async auth(context, payload) {
            let url = context.getters.loginUrl
            if (payload.mode === 'signup') {
                url = context.getters.signupUrl
            }
            console.log(payload.mode + ': ' + url)
            const response = await fetch(url, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload.data)
                }
            )
            const responseData = await response.json()
            if (!response.ok) {
                console.log(response)
                const error = new Error(responseData.message || 'Failed to authenticate')
                throw error
            }
            if (payload.mode === 'login') {
                const expiresIn = +responseData.expiresIn * 1000
                const expirationDate = new Date().getTime() + expiresIn
        
                // save data in the browser
                localStorage.setItem('token', responseData.token)
                localStorage.setItem('userId', responseData.userId)
                localStorage.setItem('tokenExpiration', expirationDate)
        
                timer = setTimeout(function() {
                    context.dispatch('autoLogout')
                }, expiresIn)
        
                // save data in vuex store
                // console.log(responseData)
                context.commit('setUser', {
                    token: responseData.idToken,
                    userId: responseData.localId
                })    
            }   
        },
        autoLogin(context) {
            const token = localStorage.getItem('token')
            const userId = localStorage.getItem('userId')
            const tokenExpiration = localStorage.getItem('tokenExpiration')
    
            const expiresIn = +tokenExpiration - new Date().getTime()
            // Ignore if remaining time is less than 1 minute
            if (expiresIn < 60000) {
                return
            }
    
            timer = setTimeout(function() {
                context.dispatch('autoLogout')
            }, expiresIn)
    
            if (token && userId) {
                context.commit('setUser', {
                    token: token,
                    userId: userId
                })
            }
        },
        logout(context) {
            // Clear local storage
            clearTimeout(timer)
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            localStorage.removeItem('tokenExpiration')
    
            context.commit('setUser', {
                token: null,
                userId: null
            })
        },
        autoLogout(context) {
            context.dispatch('logout')
            context.commit('setAutoLogout')
        }
    },
    getters: {
        userId(state) {
            return state.userId
        },
        token(state) {
            return state.token
        },
        isAuthenticated(state) {
            return !!state.token
        },
        authUrl(state) {
            return state.authUrl
        },
        firebaseUrl(state) {
            return state.firebaseUrl
        },
        apiKey(state) {
            return state.API_KEY
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
}