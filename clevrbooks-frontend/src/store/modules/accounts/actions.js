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
    }
}