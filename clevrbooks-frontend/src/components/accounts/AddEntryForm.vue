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
                <div class="form-control">
                    <label for="date">Date</label>
                    <input type="date" id="date" v-model.trim="transactionDate">
                </div>
                <div class="form-control">
                    <label for="payee">Payee</label>
                    <input type="text" id="payee" v-model.trim="payee">
                </div>
                <div class="form-control">
                    <label for="memo">Memo</label>
                    <input type="text" id="memo" v-model.trim="memo"/>
                </div>
                <p v-if="!formIsValid">Please fix errors</p>
                <base-button>Enter</base-button>
            </form>
        </base-card>        
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { useStore } from 'vuex'

    const isLoading = ref(false)
    const error = ref(null)
    const transactionDate = ref('')
    const payee = ref('')
    const memo = ref('')
    const formIsValid = ref(true)
    const store = useStore()
    const router = useRouter()
    // const route = useRoute()

    function handleError() {
        error.value = null
    }

    async function submitForm() {
        formIsValid.value = true
        if (transactionDate.value === '' || payee.value === '') {
            formIsValid.value = false
            return
        }

        // send http request to Firebase
        isLoading.value = true
        const payload = {
            date: transactionDate.value,
            payee: payee.value,
            memo: memo.value
        }
        try {
            await store.dispatch('accounts/addEntry', payload)
            try {
                await store.dispatch('accounts/getAllAccounts')
                await store.dispatch('accounts/getAllCategories')
            } catch (err) {
                error.value = err.message || 'Failed to load accounts'
            }
            // const redirectUrl = '/' + (route.query.redirect || 'accounts')
            router.replace("/")
        } catch (err) {
            error.value = err.message || 'Authentication failed!'
        }
        isLoading.value = false
    }

    onMounted(() => {
        console.log('AddEntryForm: mounted')
    })

</script>

<style>

</style>