<template>
    <div>
        <base-dialog :show="!!errorMsg" title="An error occured" @close="handleError">
            <p>{{ errorMsg }}</p>
        </base-dialog>
        <base-dialog :show="isLoading" title="inserting..." fixed>
            <base-spinner></base-spinner>
        </base-dialog>
        <base-card class="sliding-form">
        <div class="form-frame">
            <form @submit.prevent="submitForm">
                <!-- Prevent implicit submission of the form -->
                <button type="submit" disabled style="display: none" aria-hidden="true"></button>
                <h2>Account: {{ getAccountName }}</h2>
                <div class="form-control" :class="{'form-invalid': fieldInvalid.date}">
                    <label for="date">*Date:</label>
                    <input type="date" id="date" v-model.trim="transactionDate" data-lpignore="true"/>
                </div>
                <div class="form-control" :class="{'form-invalid': fieldInvalid.payee}">
                    <label for="payee">*Payee:</label>
                    <!-- <input type="text" id="payee" v-model.trim="payeeInput"> -->
                    <search-auto-complete :items="getPayeeList" @enter="onPayeeEnter"></search-auto-complete>
                </div>
                <div class="amount">
                    <div class="form-control" :class="{'form-invalid': fieldInvalid.charge}">
                        <label for="charge">Charge:</label>
                        <input type="text" id="charge" v-model.trim="chargeInput" data-lpignore="true"/>
                    </div>
                    <div class="form-control" :class="{'form-invalid': fieldInvalid.payment}">
                        <label for="payment">Payment:</label>
                        <input type="text" id="payment" v-model.trim="paymentInput" data-lpignore="true"/>
                    </div>
                </div>
                <div class="form-control">
                    <div class="xfer-to-account__checkbox">
                        <input type="checkbox" id="xfer-to-account" v-model="xferToAccount"/>
                        <label for="xfer-to-account">Transfer to account</label>
                    </div>
                    <div v-if="xferToAccount" :class="{'form-invalid': fieldInvalid.account}">
                        <label for="to-account">*Account:</label>
                        <select name="to-account" id="to-account" v-model="accountSelected">
                            <option v-for="option in accountList" :key="option.id" :value="option.name">
                                {{ option.name }}
                            </option>
                        </select>
                    </div>
                    <div v-else :class="{'form-invalid': fieldInvalid.category}">
                        <label for="category">*Category:</label>
                        <select name="category" id="category" v-model="categorySelected">
                            <option v-for="option in categoryList" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="form-control">
                    <label for="memo">Memo:</label>
                    <input type="text" id="memo" v-model.trim="memoInput" data-lpignore="true"/>
                </div>
                <div class="form-invalid-message" v-if="!formIsValid">
                    <p v-for="msg in formErrorMsg" :key="msg">{{ msg }}</p>
                </div>
                <base-button>Enter</base-button>
            </form>
            <base-button @click="addEntry">Enter+</base-button>
            <base-button @click="canClose">Cancel</base-button>
        </div>
        </base-card>
    </div>
</template>

<script setup>
    import { ref, reactive, computed, onMounted } from 'vue'
    // import { useRouter } from 'vue-router'
    import { useStore } from 'vuex'
    import useMoneyUtilities from '../../moneyUtilities'

    const { getMoneyString, isNegative, validateStringAmount } = useMoneyUtilities()

    const props = defineProps({
        accountId: {
            type: Number,
            required: true
        },
        date: {
            type: String,
            default: new Date().toLocaleString().substring(0,10),
        },
        payee: {
            type: String,
            default: ''
        },
        amount: {
            type: Number,
            default: null
        },
        memo: {
            type: String,
            default: ''
        },
        category: {
            type: String,
            default: ''
        }
    })
    const emit = defineEmits(['cancel', 'submit'])

    const isLoading = ref(false)
    const errorMsg = ref(null)
    const entryList = ref([])
    const transactionDate = ref(props.date)
    const payeeInput = ref(props.payee)
    const memoInput = ref(props.memo)
    const categorySelected = ref('')
    const accountSelected = ref('')
    const chargeInput = ref('')
    const paymentInput = ref('')
    const formErrorMsg = ref([])
    const formIsValid = ref(true)
    const xferToAccount = ref(false)
    const store = useStore()
    const fieldInvalid = reactive({
        date: false,
        payee: false,
        charge: false,
        payment: false,
        category: false,
        account: false
    })
    // const router = useRouter()
    // const route = useRoute()

    const categoryList = computed(() => {
        return store.getters['accounts/getCategoryList']
    })

    const accountList = computed(() => {
        return store.getters['accounts/accounts']
    })

    const getAccountName = computed(() => {
        return store.getters['accounts/getCurrentAccountName']
    })
    const getPayeeList = computed(() => {
        return store.getters['accounts/getUniquePayeeList']
    })

    function onPayeeEnter(param) {
        console.log(`onPayeeEnter(${param})`)
        payeeInput.value = param
        // autofill from last entry used with this payee
        const entry = store.getters['accounts/getLastEntryForPayee'](param)
        memoInput.value = entry.memo
        if (entry.xferToAccount) {
            xferToAccount.value = true
            accountSelected.value = entry.category
        } else {
            xferToAccount.value = false
            categorySelected.value = entry.category
        }
        if (isNegative(entry.amount)) {
            chargeInput.value = getMoneyString(-entry.amount)
            paymentInput.value = ''
        } else {
            paymentInput.value = getMoneyString(entry.amount)
            chargeInput.value = ''
        }
    }

    function handleError() {
        errorMsg.value = null
    }

    function addEntry() {
        console.log('validate form...')
        if (validateForm()) {
            console.log('form is valid!')
            entryList.value.push({})
            return
        }
        console.log('form is NOT valid!')
    }
    
    function setFormErrorMsg(msg) {
        console.log(msg)
        formErrorMsg.value.push(msg)
        formIsValid.value = false
        // return true for invalid
        return true
    }

    function validateForm() {
        console.log('validateForm()')
        formIsValid.value = true
        
        formErrorMsg.value = []
        Object.keys(fieldInvalid).forEach(x => fieldInvalid[x] = false)

        // payeeInput.value = 'xxxxxxxxxxxxxx'
        if (transactionDate.value === '') {
            fieldInvalid.date = setFormErrorMsg('Date cannot be empty')
        }
        if (payeeInput.value === '') {
            fieldInvalid.payee = setFormErrorMsg('Payee cannot be empty')
        }
        if (!transactionDate.value.match(/\d\d\d\d-[0-1]\d-[0-3]\d/)) {
            fieldInvalid.payee = setFormErrorMsg('Invalid Date format')
        }
        if (chargeInput.value === '' && paymentInput.value === '') {
            fieldInvalid.charge = fieldInvalid.payment = setFormErrorMsg('charge AND payment fields are empty')
        }
        if (chargeInput.value.length > 0 && paymentInput.value.length > 0) {
            fieldInvalid.charge = fieldInvalid.payment = setFormErrorMsg('charge AND payment fields are present')
        }
        if (chargeInput.value.length > 0 && !validateStringAmount(chargeInput.value)) {
            fieldInvalid.charge = setFormErrorMsg('charge field has invalid format')
        }
        if (paymentInput.value.length > 0 && !validateStringAmount(paymentInput.value)) {
            fieldInvalid.payment = setFormErrorMsg('payment field has invalid format')
        }
        if (xferToAccount.value) {
            if (accountSelected.value === '') {
                fieldInvalid.account = setFormErrorMsg('Account not set')
            }
        } else {
            if (categorySelected.value === '') {
                fieldInvalid.category = setFormErrorMsg('Category not set')
            }
        }
        return formIsValid.value
    }

    async function submitForm() {
        console.log('submit form...')
        if (!validateForm()) {
            return
        }

        // send http request to Firebase
        isLoading.value = true
        const entry = {
            date: transactionDate.value,
            payee: payeeInput.value,
            memo: memoInput.value
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
        emit('cancel')
    }

    function canClose() {
        emit('cancel')
    }

    onMounted(() => {
        // console.log('AddEntryForm: mounted')
        // console.log(`accountId: ${props.accountId}, date: ${props.date}, amount: ${props.amount}`)
        if (props.amount) {
            if (props.amount < 0) {
                chargeInput.value = getMoneyString(-props.amount)
                paymentInput.value = ''
            } else {
                chargeInput.value = ''
                paymentInput.value = getMoneyString(props.amount)
            }
        }
    })

</script>

<style scoped>

h2 {
    text-align: center;
}
label {
    margin: 0 .5rem;
}

input[type="text"] {
    width: 100%;
}

.sliding-form {
    background: #ccc;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
}

.form-control {
    margin: 1rem;
}

.amount {
    display: flex;
}

.xfer-to-account__checkbox {
    margin: 1rem;
}

.form-invalid label {
    color: red;
}
.form-invalid input {
    border: 1px solid red;
    background: rgb(253, 225, 225);
}
.form-invalid-message {
    border: 1px solid red;
    color: red;
}
.form-invalid-message p {
    text-align: center;
}

.form-frame {
    border: 2px solid #999;
    border-radius: 5px;
}
</style>