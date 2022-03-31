<template>
    <div>
        <base-dialog :show="!!errorMsg" title="An error occured" @close="handleError">
            <p>{{ errorMsg }}</p>
        </base-dialog>
        <base-dialog :show="isLoading" title="inserting..." fixed>
            <base-spinner></base-spinner>
        </base-dialog>
        <base-card class="sliding-form">
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
                <base-button @click="canClose">Cancel</base-button>
            </form>
        </base-card>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    // import { useRouter } from 'vue-router'
    import { useStore } from 'vuex'

    const props = defineProps(['accountId'])
    const emit = defineEmits(['canClose'])

    const isLoading = ref(false)
    const errorMsg = ref(null)
    const transactionDate = ref('')
    const payee = ref('')
    const memo = ref('')
    const formIsValid = ref(true)
    const store = useStore()
    // const router = useRouter()
    // const route = useRoute()

    function handleError() {
        errorMsg.value = null
    }

    async function submitForm() {
        formIsValid.value = true
        if (transactionDate.value === '' || payee.value === '') {
            formIsValid.value = false
            return
        }

        // send http request to Firebase
        isLoading.value = true
        const entry = {
            date: transactionDate.value,
            payee: payee.value,
            memo: memo.value
        }
        const payload = {
            id: props.accountId,
            payload: entry
        }
        try {
            await store.dispatch('accounts/addEntry', payload)

        } catch (err) {
            errorMsg.value = err.message || 'Authentication failed!'
        }
        isLoading.value = false
        emit('canClose')
    }
    function canClose() {
        emit('canClose')
    }

    onMounted(() => {
        console.log('AddEntryForm: mounted')
    })

</script>

<style scoped>
.sliding-form {
    background: #ccc;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
}

.form-control {
    margin: 1rem;
}

</style>