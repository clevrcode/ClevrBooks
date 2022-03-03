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

<script>
export default {
    data() {
        return {
            isLoading: false,
            error: null,
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            formIsValid: true,
            mode: 'login', // 'login' | 'signup'
        }
    },
    computed: {
        isModeRegister() {
            return this.mode === 'signup'
        },
        submitButtonCaption() {
            if (this.mode === 'login') {
                return 'Login'
            } else {
                return 'Signup'
            }
        },
        switchModeButtonCaption() {
            if (this.mode === 'login') {
                return 'Signup instead'
            } else {
                return 'Login instead'
            }
        }
    },
    methods: {
        handleError() {
            this.error = null
        },
        async submitForm() {
            this.formIsValid = true
            if (this.email === '' || !this.email.includes('@') || this.password.length < 6) {
                this.formIsValid = false
                return
            }
            if (this.isModeRegister && (this.firstName === '' || this.lastName === '')) {
                this.formIsValid = false
                return
            }
            // send http request to Firebase
            this.isLoading = true
            const payload = {
                email: this.email,
                password: this.password
            }
            if (this.isModeRegister) {
                payload.name = this.firstName + ' ' + this.lastName
            }
            console.log(payload)
            try {
                await this.$store.dispatch(this.mode, payload)
                const redirectUrl = '/' + (this.$route.query.redirect || 'accounts')
                this.$router.replace(redirectUrl)
            } catch (error) {
                this.error = error.message || 'Authentication failed!'
            }
            this.isLoading = false
        },
        switchAuthMode() {
            if (this.mode === 'login') {
                this.mode = 'signup'
            } else {
                this.mode = 'login'
            }
        }
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