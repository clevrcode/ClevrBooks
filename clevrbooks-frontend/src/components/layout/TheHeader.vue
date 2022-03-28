<template>
  <header>
    <div class="header-brand">
      <router-link to="/">ClevrBooks</router-link>
    </div>
    <nav class="header-nav">
      <ul class="header-nav__items">
          <li class="header-nav__item" v-if="isLoggedIn">
            <router-link to="/">Home</router-link>
          </li>
          <div>
            <li class="header-nav__item" v-if="isLoggedIn">
              <base-button @click="logout">Logout</base-button>
            </li>
            <li class="header-nav__item" v-else>
              <router-link :to="{ name: 'auth' }">Login</router-link>
            </li>
          </div>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const isLoggedIn = computed(() => {
  return store.getters.isAuthenticated
})

function logout() {
    store.dispatch('logout')
    store.dispatch('accounts/clearAllAccounts')
    router.replace('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Charm:wght@700&display=swap');

header {
  background: #3d008d;
  /* padding: 0.5rem 1rem; */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  margin: 0;
  font-family: 'Charm', cursive;
  font-size: 3rem;
}

.header-brand a {
  text-decoration: none;
  color: white;
  margin: 0.5rem;
}

.header-nav__items {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  display: flex;
  align-items: center;
}

.header-nav__item {
  margin: 0 0.5rem;
  padding: 0.5rem;
}

.header-nav__item a {
  text-decoration: none;
  color: #f391e3;
  padding: 1rem;
  border: none;
}

.header-nav__item a:active,
.header-nav__item a:hover,
.header-nav__item a.router-link-active {
    color: yellow;
    border: 1px solid #f391e3;
}
</style>
