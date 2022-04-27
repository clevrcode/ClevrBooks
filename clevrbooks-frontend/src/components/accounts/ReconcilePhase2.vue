<template>
  <base-card class="reconcile-card">
    <div class="reconcile-container">
      <div class="reconcile-lists">
        <div class="debits">
          <div class="reconcile-list__title">
            Payments and Cheques
          </div>
          <div class="reconcile-list__content">
            <ul>
              <li v-for="entry in debitEntries" :key="entry.id">
                <div class="reconcile-item">
                  <p id="item-date">{{ entry.date }}</p>
                  <p id="payee">{{ entry.payee }}</p>
                  <p id="amount">
                    {{ getMoneyString(entry.amount) }}
                    <input
                      type="checkbox"
                      v-model="entry.cleared"
                      @change="checkBoxChangedDebit"
                    />
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div class="reconcile-list__footer">
            <p>{{ totalDebitCount }} Cheques, debits: ${{ getTotalDebits }}</p>
          </div>
        </div>
        <div class="credits">
          <div class="reconcile-list__title">
            Deposits and Credits
          </div>
          <div class="reconcile-list__content">
            <ul>
              <li v-for="entry in creditEntries" :key="entry.id">
                <div class="reconcile-item">
                  <p id="item-date">{{ entry.date }}</p>
                  <p id="payee">{{ entry.payee }}</p>
                  <p id="amount">
                    {{ getMoneyString(entry.amount) }}
                    <input
                      type="checkbox"
                      v-model="entry.cleared"
                      @change="checkBoxChangedCredit"
                    />
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div class="reconcile-list__footer">
            <p>
              {{ totalCreditCount }} Deposit,Credits: ${{ getTotalCredits }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="reconcile-footer">
      <div class="reconcile-footer__buttons">
        <button>Done</button>
        <button>Cancel</button>
      </div>
      <div class="reconcile-summary">
        <div class="reconcile-summary__items">
          <p class="reconcile-summary__item-title">Cleared Balance:</p>
          <p class="reconcile-summary__item-value">${{ getCheckedBalance }}</p>
        </div>
        <div class="reconcile-summary__items">
          <p class="reconcile-summary__item-title">Ending Balance:</p>
          <p class="reconcile-summary__item-value">${{ getEndingBalance }}</p>
        </div>
        <div class="reconcile-summary__items" id="difference">
          <p class="reconcile-summary__item-title">
            Difference:
          </p>
          <p class="reconcile-summary__item-value">
            ${{ getBalanceDifference }}
          </p>
        </div>
      </div>
    </div>
  </base-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import useMoneyUtilities from '../../moneyUtilities'
// import AutoNumeric from 'autonumeric'

const props = defineProps(['accountId', 'data'])
// const emit = defineEmits(['complete', 'cancel'])

// const { getMoneyString, isNegative } = useMoneyUtilities()
const { getMoneyString } = useMoneyUtilities()
const store = useStore()
const creditEntries = ref([])
const debitEntries = ref([])
const totalCredits = ref(0.0)
const totalDebits = ref(0.0)
const totalCreditCount = ref(0)
const totalDebitCount = ref(0)

onMounted(() => {
  console.log('phase2:onMounted')
  const entries = store.getters['accounts/getUncheckedEntries']
  if (entries?.length > 0) {
    creditEntries.value = entries.filter((entry) => entry.amount >= 0)
    debitEntries.value = entries.filter((entry) => entry.amount < 0)
  }
})

const getTotalDebits = computed(() => {
  return getMoneyString(totalDebits.value)
})
const getTotalCredits = computed(() => {
  return getMoneyString(totalCredits.value)
})

const getEndingBalance = computed(() => {
  return getMoneyString(props.data.endBalance)
})

const getCheckedBalance = computed(() => {
  let balance = totalCredits.value + totalDebits.value
  return getMoneyString(balance)
})

const getBalanceDifference = computed(() => {
  let balance = totalCredits.value + totalDebits.value - props.data.endBalance
  return getMoneyString(balance)
})

function checkBoxChangedCredit() {
  console.log('checkBoxChangedCredit()')
  totalCredits.value = 0
  totalCreditCount.value = 0
  creditEntries.value.forEach((e) => {
    if (e.cleared) {
      totalCredits.value += e.amount
      totalCreditCount.value++
    }
  })
}
function checkBoxChangedDebit() {
  console.log('checkBoxChangedDebit()')
  totalDebits.value = 0
  totalDebitCount.value = 0
  debitEntries.value.forEach((e) => {
    if (e.cleared) {
      totalDebits.value += e.amount
      totalDebitCount.value++
    }
  })
}
</script>

<style scoped>
.reconcile-card {
  width: 95%;
}

.reconcile-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.reconcile-lists {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.reconcile-list__title {
  background: rgb(207, 207, 217);
  padding: 2px;
  text-align: center;
}

.reconcile-list__content {
  height: 100%;
  justify-content: flex-start;
}

.reconcile-list__footer {
  /* border-top: 2px solid black; */
  background: rgb(207, 207, 217);
  padding: 0 0 0 1rem;
}

.credits,
.debits {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 50%;
  padding: 0.5rem;
  border: 1px solid black;
}

.credits ul,
.debits ul {
  list-style: none;
  padding: 0;
  margin: 0.2rem;
}

.reconcile-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px dotted black;
  font-size: 0.85rem;
}

.reconcile-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.reconcile-footer__buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.reconcile-footer__buttons button {
  width: 5rem;
  padding: 5px;
  margin: 5px 3rem;
}

.reconcile-summary {
  display: flex;
  width: 40%;
  margin: 1rem 0 0 0;
  flex-direction: column;
  justify-content: flex-end;
}

.reconcile-summary__items {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.reconcile-summary__item-title {
  margin: 5px;
  width: 50%;
  text-align: right;
}
.reconcile-summary__item-value {
  margin: 5px;
}

#item-date {
  margin: 5px;
}
#payee {
  margin: 5px;
  width: 100%;
  align-self: flex-start;
  padding: 0 1rem;
}
#amount {
  display: flex;
  align-items: center;
  margin: 5px;
  padding: 0;
}
#difference {
  padding: 0;
  border-top: 2px solid black;
}
</style>
