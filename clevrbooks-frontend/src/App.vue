<template>
  <div class="main-app">
    <the-header></the-header>
    <div class="main-app__display">
      <router-view v-slot="slotProps">
        <transition name="route" mode="out-in">
            <component :is="slotProps.Component"></component>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
import TheHeader from './components/layout/TheHeader.vue'

export default {
  name: 'App',
  components: {
    TheHeader
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
        this.$router.replace('/')
      }
    }

  }
}
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");

* {
  box-sizing: border-box;
}

html {
  font-family: "Roboto", sans-serif;
}

body {
  margin: 0;
}

/* .main-app {
  display: flex;
  flex-direction: column;
} */

.main-app__display {
  margin-top: 6rem;
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
