const axios = require('axios')

export default {
  async getAllAccounts(context) {
    // console.log('getAllAccounts()')
    const url = context.rootGetters.apiUrl + 'accounts'
    const token = context.rootGetters.token
    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })
      // save data in vuex store
      //console.log(response.data)
      context.commit('setAccounts', response.data)
    } catch (error) {
      console.log(error.message)
      throw error
    }
  },

  async getAllCategories(context) {
    // console.log('getAllCategories()')
    const url = context.rootGetters.apiUrl + 'categories'
    const token = context.rootGetters.token

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })
      // save data in vuex store
      // console.log(response.data)
      context.commit('setCategories', response.data)
    } catch (error) {
      console.log(error.message)
      throw error
    }
  },

  async getEntriesForAccount(context, params) {
    // console.log(`getEntriesForAccount(id:${params.id},order:${params.order})`)
    const url = context.rootGetters.apiUrl + 'account/' + params.id
    const token = context.rootGetters.token

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        params: {
          limit: params.limit,
          order: params.order,
        },
      })
      // save data in vuex store
      context.commit('setEntries', {
        accountId: params.id,
        entries: response.data.entries,
        nextCheck: response.data.nextCheck,
      })
    } catch (error) {
      console.log(error.message)
      throw error
    }
  },

  clearAllAccounts(context) {
    context.commit('clearAccounts')
  },

  async addEntry(context, params) {
    const url = context.rootGetters.apiUrl + 'account/' + params.id
    const token = context.rootGetters.token
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    }
    try {
      // params.edit true means that we need to update an existing entry
      if (params.edit) {
        const response = await axios.put(url, params.payload, { headers })
        console.log(`response: ${response.data.message}`)
        response.data.affectedAccounts.forEach((acc) => {
          console.log(
            `affected account: ${acc.id}, balance: ${acc.currentBalance}`,
          )
          context.commit('updateAccount', acc)
        })
      } else {
        const response = await axios.post(url, params.payload, { headers })
        console.log(`response: ${response.data.message}`)
        response.data.affectedAccounts.forEach((acc) => {
          console.log(
            `affected account: ${acc.id}, balance: ${acc.currentBalance}`,
          )
          context.commit('updateAccount', acc)
        })
        // save data in vuex store
        context.commit('appendEntry', params.payload)
      }
    } catch (error) {
      console.log(error.message)
      throw error
    }
  },
  async deleteEntry(context, params) {
    const url = context.rootGetters.apiUrl + 'account/' + params.id
    const token = context.rootGetters.token
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    }
    console.log(`delete entry from account: ${params.id}`)
    try {
      const response = await axios.delete(url, {
        headers,
        params: {
          entryId: params.entryId,
        },
      })
      console.log(`response: ${response.data.message}`)
      response.data.affectedAccounts.forEach((acc) => {
        console.log(
          `affected account: ${acc.id}, balance: ${acc.currentBalance}`,
        )
        context.commit('updateAccount', acc)
      })
    } catch (error) {
      console.log(error)
    }
  },
}
