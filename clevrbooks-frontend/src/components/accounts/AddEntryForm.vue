<template>
  <div>
    <base-dialog
      :show="!!errorMsg"
      title="An error occured"
      @close="handleError"
    >
      <p>{{ errorMsg }}</p>
    </base-dialog>
    <base-dialog :show="isLoading" title="inserting..." fixed>
      <base-spinner></base-spinner>
    </base-dialog>
    <base-card class="sliding-form">
      <div class="form-frame">
        <form @submit.prevent="addEntry(true)">
          <!-- Prevent implicit submission of the form -->
          <button
            type="submit"
            disabled
            style="display: none;"
            aria-hidden="true"
          ></button>
          <h2>Account: {{ getAccountName }}</h2>
          <div
            class="form-control"
            :class="{ 'form-invalid': fieldInvalid.date }"
          >
            <label for="date">*Date:</label>
            <input
              type="date"
              id="date"
              v-model.trim="transactionDate"
              data-lpignore="true"
            />
          </div>
          <div
            class="form-control"
            :class="{ 'form-invalid': fieldInvalid.payee }"
          >
            <label for="payee">*Payee:</label>
            <!-- <input type="text" id="payee" v-model.trim="payeeInput"> -->
            <search-auto-complete
              :items="getPayeeList"
              @enter="onPayeeEnter"
              @val-change="onPayeeChange"
              :initext="props.payee"
            ></search-auto-complete>
          </div>
          <div class="form-control banking-account" v-if="isBankingAccount">
            <label for="transaction-type">Type</label>
            <select
              name="transaction-type"
              id="transaction-type"
              v-model="typeInput"
            >
              <option
                v-for="option in transactionTypeList"
                :key="option.id"
                :value="option.name"
              >
                {{ option.name }}
              </option>
            </select>
            <label for="check-number">Check #</label>
            <input
              type="text"
              id="check-number"
              v-model.number="checkNumberInput"
              data-lpignore="true"
            />
          </div>
          <div class="amount">
            <div
              class="form-control"
              :class="{ 'form-invalid': fieldInvalid.charge }"
            >
              <label for="charge">Charge:</label>
              <input type="text" id="charge" data-lpignore="true" />
            </div>
            <div
              class="form-control"
              :class="{ 'form-invalid': fieldInvalid.payment }"
            >
              <label for="payment">Payment:</label>
              <input type="text" id="payment" data-lpignore="true" />
            </div>
          </div>
          <div class="form-control">
            <div class="xfer-to-account__checkbox">
              <input
                type="checkbox"
                id="xfer-to-account"
                v-model="xferToAccount"
              />
              <label for="xfer-to-account">Transfer to account</label>
            </div>
            <div
              v-if="xferToAccount"
              :class="{ 'form-invalid': fieldInvalid.account }"
            >
              <label for="to-account">*Account:</label>
              <select
                name="to-account"
                id="to-account"
                v-model="accountSelected"
              >
                <option
                  v-for="option in accountList"
                  :key="option.id"
                  :value="option.name"
                >
                  {{ option.name }}
                </option>
              </select>
            </div>
            <div v-else :class="{ 'form-invalid': fieldInvalid.category }">
              <label for="category">*Category:</label>
              <select name="category" id="category" v-model="categorySelected">
                <option
                  v-for="option in categoryList"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-control">
            <label for="memo">Memo:</label>
            <input
              type="text"
              id="memo"
              v-model.trim="memoInput"
              data-lpignore="true"
            />
          </div>
          <div class="form-invalid-message" v-if="!formIsValid">
            <p v-for="msg in formErrorMsg" :key="msg">{{ msg }}</p>
          </div>
          <base-button>Enter</base-button>
        </form>
        <base-button @click="addEntry(false)" v-if="isEditMode">
          Enter+
        </base-button>
        <base-button @click="canClose">Cancel</base-button>
      </div>
    </base-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
// import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import useMoneyUtilities from '../../moneyUtilities'
import AutoNumeric from 'autonumeric'

const { isNegative } = useMoneyUtilities()

const props = defineProps({
  banking: {
    type: Boolean,
    required: false,
    default: false,
  },
  accountId: {
    type: Number,
    required: true,
  },
  // If id not null, then the form is set for editing
  id: {
    type: Number,
    required: false,
    default: null,
  },
  checkNumber: {
    type: Number,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: false,
    default: null,
  },
  date: {
    type: String,
    default: new Date().toLocaleString().substring(0, 10),
  },
  payee: {
    type: String,
    default: '',
  },
  amount: {
    type: Number,
    default: null,
  },
  memo: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
  xferToAccount: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['cancel', 'submit'])

const isLoading = ref(false)
const errorMsg = ref(null)
const transactionDate = ref(props.date)
const checkNumberInput = ref(props.checkNumber)
const typeInput = ref(props.type)
const payeeInput = ref(props.payee)
const memoInput = ref(props.memo)
const categorySelected = ref('')
const accountSelected = ref('')
const formErrorMsg = ref([])
const formIsValid = ref(true)
const xferToAccount = ref(props.xferToAccount)
const store = useStore()
const fieldInvalid = reactive({
  date: false,
  payee: false,
  charge: false,
  payment: false,
  category: false,
  account: false,
})
// const router = useRouter()
// const route = useRoute()
// let chargeAutoNumeric = null
// let paymentAutoNumeric = null

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

const isBankingAccount = computed(() => {
  return props.banking
})

const isEditMode = computed(() => {
  return !(props.id && typeof props.id !== 'undefined')
})

const transactionTypeList = [
  { id: 1, name: 'Next Check' },
  { id: 1, name: 'ATM' },
  { id: 1, name: 'EFT' },
]

watch(typeInput, (newValue) => {
  if (newValue === 'Next Check') {
    checkNumberInput.value = store.getters['accounts/getNextCheckNumber']
    typeInput.value = null
  }
})

function onPayeeChange(param) {
  payeeInput.value = param
  // console.log(`payee: ${payeeInput.value}`)
}

function onPayeeEnter(param) {
  console.log(`onPayeeEnter(${param})`)
  payeeInput.value = param
  // autofill from last entry used with this payee
  const entry = store.getters['accounts/getLastEntryForPayee'](param)
  if (entry) {
    memoInput.value = entry.memo
    if (entry.xferToAccount) {
      xferToAccount.value = true
      accountSelected.value = entry.category
    } else {
      xferToAccount.value = false
      categorySelected.value = entry.category
    }
    if (isNegative(entry.amount)) {
      AutoNumeric.set('#charge', -entry.amount)
    } else {
      AutoNumeric.set('#payment', entry.amount)
    }
  }
}

// function focusNext(e) {
//     const inputs = Array.from(e.target.form.querySelectorAll('input[type="text"]'));
//     const index = inputs.indexOf(e.target);

//     if (index < inputs.length) {
//         inputs[index + 1].focus();
//     }
// }

function handleError() {
  errorMsg.value = null
}

function buildRequest() {
  let category = 0
  let subcategory = null
  if (xferToAccount.value) {
    category = store.getters['accounts/getAccountByName'](accountSelected.value)
      .id
  } else {
    const catnames = categorySelected.value.split(':')
    // console.log(catnames)
    category = store.getters['accounts/getCategoryByName'](catnames[0]).id
    // console.log(`category: ${category}`)
    if (catnames.length > 1) {
      subcategory = store.getters['accounts/getSubcategoryByName'](catnames[1])
        .id
    }
  }

  const charge = -AutoNumeric.getNumber('#charge')
  const payment = AutoNumeric.getNumber('#payment')
  let amount = 0
  // console.log(`charge : ${charge}`)
  // console.log(`payment: ${payment}`)
  if (payment !== 0) {
    amount = payment
  } else if (charge !== 0) {
    amount = charge
  }
  if (checkNumberInput.value && typeInput.value && typeInput.value.length > 0) {
    typeInput.value = null
  }

  const request = {
    id: props.id,
    date: transactionDate.value,
    payee: payeeInput.value,
    checkNumber: checkNumberInput.value,
    type: typeInput.value,
    memo: memoInput.value,
    xferToAccount: xferToAccount.value ? 1 : 0,
    category: category,
    subcategory: subcategory,
    cleared: 0,
    amount: amount,
    accountId: props.accountId,
  }
  return request
}

function addEntry(close) {
  submitForm()
  if (close) {
    canClose()
  }
}

function setFormErrorMsg(msg) {
  console.log(msg)
  formErrorMsg.value.push(msg)
  formIsValid.value = false
  // return true for invalid
  return true
}

function validateForm() {
  //   console.log('validateForm()')
  formIsValid.value = true

  formErrorMsg.value = []
  Object.keys(fieldInvalid).forEach((x) => (fieldInvalid[x] = false))

  if (transactionDate.value === '') {
    fieldInvalid.date = setFormErrorMsg('Date cannot be empty')
  }
  if (payeeInput.value === '') {
    fieldInvalid.payee = setFormErrorMsg('Payee cannot be empty')
  }
  if (!transactionDate.value.match(/\d\d\d\d-[0-1]\d-[0-3]\d/)) {
    fieldInvalid.payee = setFormErrorMsg('Invalid Date format')
  }

  const charge = -AutoNumeric.getNumber('#charge')
  const payment = AutoNumeric.getNumber('#payment')

  if (charge === 0 && payment === 0) {
    fieldInvalid.charge = fieldInvalid.payment = setFormErrorMsg(
      'charge AND payment fields are empty',
    )
  }
  if (charge !== 0 && payment !== 0) {
    fieldInvalid.charge = fieldInvalid.payment = setFormErrorMsg(
      'charge AND payment fields are present',
    )
  }
  if (xferToAccount.value) {
    if (accountSelected.value === '') {
      fieldInvalid.account = setFormErrorMsg('Account not set')
    }
    if (accountSelected.value.length > 0) {
      const accId = store.getters['accounts/getAccountByName'](
        accountSelected.value,
      ).id
      if (accId === props.accountId) {
        fieldInvalid.account = setFormErrorMsg(
          'Selected account same as origin account',
        )
      }
    }
  } else {
    if (categorySelected.value === '') {
      fieldInvalid.category = setFormErrorMsg('Category not set')
    }
  }
  return formIsValid.value
}

async function submitForm() {
  // console.log('submit form...')
  if (!validateForm()) {
    return
  }

  // Build and send request to backend
  isLoading.value = true
  const entry = buildRequest()
  const payload = {
    id: props.accountId,
    edit: props.id != null,
    payload: entry,
  }
  try {
    await store.dispatch('accounts/addEntry', payload)
  } catch (err) {
    errorMsg.value = err.message || 'Submit failed!'
  }
  emit('submit', payload)
  isLoading.value = false
}

function canClose() {
  emit('cancel')
}

onMounted(() => {
  // console.log('AddEntryForm: mounted')
  // FIXME: should we check for undefined?
  new AutoNumeric('#charge', { currencySymbol: '$' })
  new AutoNumeric('#payment', { currencySymbol: '$' })
  console.log(`props.id: ${props.id}`)
  if (props.amount !== null) {
    if (props.amount < 0) {
      console.log(`set charge to: ${-props.amount}`)
      AutoNumeric.set('#charge', -props.amount)
      // chargeInput.value = getMoneyString(-props.amount)
      // paymentInput.value = ''
    } else {
      console.log(`set payment to: ${props.amount}`)
      AutoNumeric.set('#payment', props.amount)
      // chargeInput.value = ''
      // paymentInput.value = getMoneyString(props.amount)
    }
  }
  if (props.xferToAccount) {
    accountSelected.value = props.category
    categorySelected.value = ''
  } else {
    categorySelected.value = props.category
    accountSelected.value = ''
  }
})
</script>

<style scoped>
h2 {
  text-align: center;
}
label {
  margin: 0 0.5rem;
}

input[type='text'] {
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
.banking-account {
  display: flex;
  justify-content: space-evenly;
}
.banking-account input {
  width: 100px;
}
</style>
