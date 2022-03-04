import { createStore } from 'vuex'

import authModule from './modules/auth'
import accountsModule from './modules/accounts'

const store = createStore({
    modules: {
        auth: authModule,
        accounts: accountsModule
    }
})

export default store
