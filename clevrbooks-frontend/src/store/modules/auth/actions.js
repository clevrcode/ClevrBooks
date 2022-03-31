const axios = require('axios')
let timer

export default {
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
        try {
            const response = await axios.post(url, payload.data, 
                { headers: { 'Content-Type': 'application/json' } })

            if (payload.mode === 'login') {
                const expiresIn = +response.data.expiresIn * 1000
                const expirationDate = new Date().getTime() + expiresIn
        
                // save data in the browser
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('userId', response.data.userId)
                localStorage.setItem('tokenExpiration', expirationDate)
                localStorage.setItem('lastUser', payload.data.email)
                timer = setTimeout(function() {
                    context.dispatch('autoLogout')
                }, expiresIn)
        
                // save data in vuex store
                context.commit('setUser', {
                    token: response.data.token,
                    userId: response.data.userId
                })
            }       
        } catch (error) {
            console.log('login error')
            console.log(error)
            throw error
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
        console.log(`token expires at: ${new Date(+tokenExpiration).toLocaleString()}`)
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
}