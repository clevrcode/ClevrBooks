<template>
    <div>
        <base-dialog :show="!!error" title="An error occured" @close="handleError">
        <p>{{ error }}</p>
        </base-dialog>
        <base-dialog :show="isLoading" title="Authenticating..." fixed>
        <base-spinner></base-spinner>
        </base-dialog>
        <base-card>
        <form @submit.prevent="submitForm">
            <div class="form-control" v-if="isModeRegister">
                <label for="firstName">First Name *</label>
                <input type="text" id="firstName" v-model.trim="firstName">
            </div>
            <div class="form-control" v-if="isModeRegister">
                <label for="lastName">Last Name *</label>
                <input type="text" id="lasttName" v-model.trim="lastName">
            </div>
            <div class="form-control">
                <label for="email">E-Mail *</label>
                <input type="email" id="email" v-model.trim="email"/>
            </div>
            <div class="form-control">
                <label for="password">Password *</label>
                <input type="password" id="password" v-model.trim="password"/>
            </div>
            <p v-if="!formIsValid">Please enter a valid email and password (password must be at least 6 characters)</p>
            <base-button>{{ submitButtonCaption }}</base-button>
            <base-button type="button" mode="flat" @click="switchAuthMode">{{ switchModeButtonCaption }}</base-button>
        </form>
        </base-card>        
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { useStore } from 'vuex'

    const isLoading = ref(false)
    const error = ref(null)
    const firstName = ref('')
    const lastName = ref('')
    const email = ref('')
    const password = ref('')
    const formIsValid = ref(true)
    const mode = ref('login')
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const isModeRegister = computed(() => { return mode.value === 'signup' })

    const submitButtonCaption = computed(() => {
        if (mode.value === 'login') {
            return 'Login'
        } else {
            return 'Signup'
        }
    })

    const switchModeButtonCaption = computed(() => {
        if (mode.value === 'login') {
            return 'Signup instead'
        } else {
            return 'Login instead'
        }
    })

    function handleError() {
        error.value = null
    }

    async function submitForm() {
        formIsValid.value = true
        if (email.value === '' || !email.value.includes('@') || password.value.length < 6) {
            formIsValid.value = false
            return
        }
        if (isModeRegister.value && (firstName.value === '' || lastName.value === '')) {
            formIsValid.value = false
            return
        }
        // send http request to Firebase
        isLoading.value = true
        const payload = {
            email: email.value,
            password: password.value
        }
        if (isModeRegister.value) {
            payload.name = firstName.value + ' ' + lastName.value
        }
        try {
            await store.dispatch(mode.value, payload)
            const redirectUrl = '/' + (route.query.redirect || 'accounts')
            router.replace(redirectUrl)
        } catch (err) {
            error.value = err.message || 'Authentication failed!'
        }
        isLoading.value = false
    }

    function switchAuthMode() {
        if (mode.value === 'login') {
            mode.value = 'signup'
        } else {
            mode.value = 'login'
        }
    }

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