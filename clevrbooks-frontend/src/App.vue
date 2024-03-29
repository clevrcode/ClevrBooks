<template>
  <div class="main-app">
    <base-dialog
      :show="!!errorMsg"
      title="An error occured!"
      @close="handleError"
    >
      <p>{{ errorMsg }}</p>
    </base-dialog>
    <the-header class="the-header"></the-header>
    <div class="main-app__display">
      <the-sidebar class="main-app__sidebar"></the-sidebar>
      <router-view class="main-app__content" v-slot="slotProps">
        <component :is="slotProps.Component"></component>
      </router-view>
    </div>
    <the-footer class="the-footer"></the-footer>
  </div>
</template>

<script>
import TheHeader from './components/layout/TheHeader.vue'
import TheSidebar from './components/layout/TheSidebar.vue'
import TheFooter from './components/layout/TheFooter.vue'

export default {
  name: 'App',
  components: {
    TheHeader,
    TheSidebar,
    TheFooter,
  },
  data() {
    return {
      errorMsg: null,
    }
  },
  computed: {
    didAutoLogout() {
      return this.$store.getters.didAutoLogout
    },
  },
  methods: {
    handleError() {
      this.errorMsg = null
    },
  },
  async mounted() {
    this.$store.dispatch('autoLogin')
    if (this.$store.getters.isAuthenticated) {
      try {
        await this.$store.dispatch('accounts/getAllAccounts')
        await this.$store.dispatch('accounts/getAllCategories')
      } catch (err) {
        this.errorMsg = err.message || 'Failed to load accounts'
      }
    }
  },
  watch: {
    didAutoLogout(curValue, oldValue) {
      if (curValue && curValue != oldValue) {
        this.$store.dispatch('accounts/clearAllAccounts')
        this.$router.replace('/')
      }
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

* {
  box-sizing: border-box;
}

html {
  height: 100%;
  overflow-x: hidden;
}

body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  height: 100%;
  padding-top: 0;
}

.main-app {
  height: 100%;
  display: grid;
  overflow-x: hidden;
  grid-template-rows: 5rem calc(100vh - 8rem) 3rem;
  grid-template-areas:
    'header'
    'main'
    'footer';
}

.the-header {
  grid-area: header;
  position: sticky;
  top: 0;
}

.main-app__display {
  grid-area: main;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.main-app__sidebar {
  width: 20%;
  overflow-x: hidden;
}

.main-app__content {
  width: 80%;
  overflow-y: auto;
  overflow-x: hidden;
}

.the-footer {
  grid-area: footer;
  position: sticky;
  bottom: 0;
}
</style>
