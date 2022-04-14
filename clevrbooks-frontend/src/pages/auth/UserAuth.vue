<template>
  <div>
    <base-dialog
      :show="!!errorMsg"
      title="An error occured"
      @close="handleError"
    >
      <p>{{ errorMsg }}</p>
    </base-dialog>
    <base-dialog :show="isLoading" title="Authenticating..." fixed>
      <base-spinner></base-spinner>
    </base-dialog>
    <base-card>
      <form @submit.prevent="submitForm">
        <div class="form-control" v-if="isModeRegister">
          <label for="firstName">First Name *</label>
          <input type="text" id="firstName" v-model.trim="firstName" />
        </div>
        <div class="form-control" v-if="isModeRegister">
          <label for="lastName">Last Name *</label>
          <input type="text" id="lasttName" v-model.trim="lastName" />
        </div>
        <div class="form-control">
          <label for="email">E-Mail *</label>
          <input type="email" id="email" v-model.trim="email" />
        </div>
        <div class="form-control">
          <label for="password">Password *</label>
          <input type="password" id="password" v-model.trim="password" />
        </div>
        <p v-if="!formIsValid">
          Please enter a valid email and password (password must be at least 6
          characters)
        </p>
        <base-button>{{ submitButtonCaption }}</base-button>
        <base-button type="button" mode="flat" @click="switchAuthMode">
          {{ switchModeButtonCaption }}
        </base-button>
      </form>
    </base-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const isLoading = ref(false)
const errorMsg = ref(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const formIsValid = ref(true)
const mode = ref('login')
const store = useStore()
const router = useRouter()
// const route = useRoute()

const isModeLogin = computed(() => {
  return mode.value === 'login'
})
const isModeRegister = computed(() => {
  return !isModeLogin.value
})

const submitButtonCaption = computed(() => {
  if (isModeLogin.value) {
    return 'Login'
  } else {
    return 'Signup'
  }
})

const switchModeButtonCaption = computed(() => {
  if (isModeLogin.value) {
    return 'Signup instead'
  } else {
    return 'Login instead'
  }
})

function handleError() {
  errorMsg.value = null
}

async function submitForm() {
  formIsValid.value = true
  if (
    email.value === '' ||
    !email.value.includes('@') ||
    password.value.length < 6
  ) {
    formIsValid.value = false
    return
  }
  if (
    isModeRegister.value &&
    (firstName.value === '' || lastName.value === '')
  ) {
    formIsValid.value = false
    return
  }
  // send http request to Firebase
  isLoading.value = true
  const payload = {
    email: email.value,
    password: password.value,
  }
  if (isModeRegister.value) {
    payload.name = firstName.value + ' ' + lastName.value
  }
  try {
    await store.dispatch(mode.value, payload)
    try {
      await store.dispatch('accounts/getAllAccounts')
      await store.dispatch('accounts/getAllCategories')
    } catch (err) {
      errorMsg.value = err.message || 'Failed to load accounts'
    }
    // const redirectUrl = '/' + (route.query.redirect || 'accounts')
    router.replace('/')
  } catch (error) {
    console.log(error)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('error.response')
      errorMsg.value = error.response.data.error + ` (${error.response.status})`
      // } else if (error.request) {
      //   // The request was made but no response was received
      //   // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      //   // http.ClientRequest in node.js
      //   console.log('error.request')
      //   errorMsg.value = `Request error ${error.request}`
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('error other: ' + error.message)
      errorMsg.value = error.message || 'Authentication failed!'
    }
  }
  isLoading.value = false
}

function switchAuthMode() {
  if (isModeLogin.value) {
    mode.value = 'signup'
  } else {
    mode.value = 'login'
  }
}

onMounted(() => {
  const userEmail = localStorage.getItem('lastUser')
  // console.log(typeof userEmail)
  // console.log(userEmail)
  if (typeof userEmail !== 'undefined') {
    email.value = userEmail
  }
})
</script>

<style scoped>
form {
  margin: 1rem;
  /* border: 1px solid #ccc;
  border-radius: 12px; */
  padding: 1rem;
}

.form-control {
  margin: 0.5rem 0;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}

input,
textarea {
  display: block;
  width: 100%;
  font: inherit;
  border: 1px solid #ccc;
  padding: 0.15rem;
}

input:focus,
textarea:focus {
  border-color: #3d008d;
  background-color: #faf6ff;
  outline: none;
}
</style>
