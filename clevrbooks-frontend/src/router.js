import { createRouter, createWebHistory } from 'vue-router'

import store from './store'
import HomePage from './pages/HomePage.vue'
import UserAuth from './pages/auth/UserAuth.vue'
import AccountList from './pages/accounts/AccountList.vue'
import AccountDetail from './pages/accounts/AccountDetail.vue'
import NotFound from './pages/NotFound.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/home' },
        { path: '/home', component: HomePage },
        { path: '/accounts/:id', component: AccountDetail, props: true, meta: { requiresAuth: true }},
        { path: '/accounts', component: AccountList, meta: { requiresAuth: true }},
        { path: '/auth', component: UserAuth, meta: { requiresUnauth: true }},
        { path: '/:notFound(.*)', component: NotFound },
    ]
})

router.beforeEach(function(to, _, next) {
    if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
        next('/auth')
    } else if (to.meta.requiresUnauth && store.getters.isAuthenticated) {
        next('/home')
    } else {
        next()
    }
})
export default router
