<template>
  <header>
      <nav>
          <h1><router-link to="/">ClevrBooks</router-link></h1>
          <ul>
              <li v-if="isLoggedIn"><router-link to="/accounts">All Accounts</router-link></li>
              <li v-if="isLoggedIn"><base-button @click="logout">Logout</base-button></li>
              <li v-else><router-link to="/auth">Login</router-link></li>
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
    router.replace('/home')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Charm:wght@700&display=swap');

header {
  width: 100%;
  height: 5rem;
  background-color: #3d008d;
  display: flex;
  justify-content: center;
  align-items: center;
}

header a {
  text-decoration: none;
  color: #f391e3;
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
}

a:active,
a:hover,
a.router-link-active {
    color: yellow;
    border: 1px solid #f391e3;
}

h1 {
  margin: 0;
  font-family: 'Charm', cursive;
  font-size: 300%;
}

h1 a {
  color: white;
  margin: 0;
}

h1 a:hover,
h1 a:active,
h1 a.router-link-active {
  border-color: transparent;
}

header nav {
  width: 90%;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

li {
  margin: 0 0.5rem;
}
</style>
