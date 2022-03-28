const withQuery = require('with-query').default

export default {

    async getAllAccounts(context) {
        // console.log('getAllAccounts()')
        const url = context.rootGetters.apiUrl + 'accounts'
        const token = context.rootGetters.token

        const response = await fetch(url, 
            {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
        )
        const responseData = await response.json()
        if (!response.ok) {
            // console.log(response)
            const error = new Error(responseData.message || 'Failed to authenticate')
            throw error
        }

        // save data in vuex store
        //console.log(responseData)
        context.commit('setAccounts', responseData)
    },

    async getAllCategories(context) {
        // console.log('getAllCategories()')
        const url = context.rootGetters.apiUrl + 'categories'
        const token = context.rootGetters.token

        const response = await fetch(url, 
            {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
        )
        const responseData = await response.json()
        if (!response.ok) {
            // console.log(response)
            const error = new Error(responseData.message || 'Failed to authenticate')
            throw error
        }

        // save data in vuex store
        // console.log(responseData)
        context.commit('setCategories', responseData)
    },

    async getEntriesForAccount(context, params) {
        // console.log(`getEntriesForAccount(id:${params.id},order:${params.order})`)

        const query = withQuery(context.rootGetters.apiUrl + 'entries/' + params.id, {
          limit: params.limit,
          order: params.order
        })
        // console.log('Query: ' + query)
        
        const token = context.rootGetters.token

        try {
            const response = await fetch(query, 
                {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                }
            )
            const responseData = await response.json()
            if (!response.ok) {
                const error = new Error(responseData.message || 'Access violation')
                throw error
            }
            // save data in vuex store
            context.commit('setEntries', { accountId: params.id, entries: responseData })
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    clearAllAccounts(context) {
        context.commit('clearAccounts')
    }
}