<template>
  <div class="main-app">
    <the-header class="the-header"></the-header>
    <div class="main-app__display">
      <the-sidebar class="main-app__sidebar"></the-sidebar>
      <router-view class="main-app__content" v-slot="slotProps">
        <transition name="route" mode="out-in">
            <component :is="slotProps.Component"></component>
        </transition>
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
    TheFooter
  },
  computed: {
    didAutoLogout() {
      return this.$store.getters.didAutoLogout
    }
  },
  created() {
    this.$store.dispatch('autoLogin')
  },
  watch: {
    didAutoLogout(curValue, oldValue) {
      if (curValue && (curValue != oldValue)) {
        this.$store.dispatch('accounts/clearAllAccounts')
        this.$router.replace('/')
      }
    }

  }
}
</script>

<style>

@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");

* {
  box-sizing: border-box;
}

html {
  height: 100%;
}

body {
  font-family: "Roboto", sans-serif;
  margin: 0;
  height: 100%;
  padding-top: 0;
}

.main-app {
  height: 100%;
  display: grid;
  grid-template-rows: 5rem calc(100vh - 8rem) 3rem;
  grid-template-areas: "header"
                        "main"
                        "footer";
}

.the-header {
  /* width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10; */
  grid-area: header;
  position: sticky;
  top: 0;

}

.main-app__display {
  /* margin-top: 75PX; */
  grid-area: main;
  display: flex;
  /* height: 100%; */
  flex-direction: row;
  justify-content: space-between;
}

.main-app__sidebar {
  width: 20%;
}

.main-app__content {
  width: 80%;
  overflow-y: auto;
}

.the-footer {
  /* align-self: center;
  height: 100%; */
  grid-area: footer;
  position: sticky;
  bottom: 0;
}

.route-enter-from {
    opacity: 0;
    transform: translateY(-30px);
}
.route-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.route-enter-active {
    transition: all 0.3s ease-out;
}

.route-leave-active {
    transition: all 0.3s ease-in;
}

.route-enter-to,
.route-leave-from {
    opacity: 1;
    transform: translateY(0);
}
</style>
