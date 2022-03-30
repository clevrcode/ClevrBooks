import { createRouter, createWebHistory } from 'vue-router'
// import { createRouter } from 'vue-router'

import store from './store'
import HomePage from './pages/HomePage.vue'
import UserAuth from './pages/auth/UserAuth.vue'
// import AccountDetail from './pages/accounts/AccountDetail.vue'
import AccountEntries from './pages/accounts/AccountEntries.vue'

import NotFound from './pages/NotFound.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: HomePage },
        { path: '/account/:id', name: 'accountentries', component: AccountEntries, props: true, meta: { requiresAuth: true }},
        // { path: '/entries/:id', name: 'accountentries', component: AccountEntries, props: true, meta: { requiresAuth: true } },
        { path: '/auth', name: 'auth', component: UserAuth, meta: { requiresUnauth: true }},
        { path: '/:notFound(.*)', component: NotFound },
    ]
})

router.beforeEach(function(to, _, next) {
    if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
        console.log('goto auth:' + to.path)
        next('/')
    } else if (to.meta.requiresUnauth && store.getters.isAuthenticated) {
        console.log('goto home')
        next('/')
    } else {
        next()
    }
})
export default router
