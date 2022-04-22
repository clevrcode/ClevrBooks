<template>
  <base-card class="reconcile-card">
    <div class="reconcile-container">
      <div class="reconcile-lists">
        <div class="credits">
          <ul>
            <li v-for="entry in creditEntries" :key="entry.id">
              <div class="reconcile-item">
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
          <div>
            <p>Total Credits: ${{ getTotalCredits }}</p>
          </div>
        </div>
        <div class="debits">
          <ul>
            <li v-for="entry in debitEntries" :key="entry.id">
              <div class="reconcile-item">
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
          <div>
            <p>Total Debits: ${{ getTotalDebits }}</p>
          </div>
        </div>
      </div>
      <div class="reconcile-summary">
        <p>Checked Balance: ${{ getCheckedBalance }}</p>
        <p>Ending balance : ${{ getEndBalance }}</p>
        <p id="difference">Difference : ${{ getBalanceDifference }}</p>
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

onMounted(() => {
  console.log('phase2:onMounted')
  const entries = store.getters['accounts/getUncheckedEntries']
  if (entries?.length > 0) {
    creditEntries.value = entries.filter((entry) => entry.amount < 0)
    debitEntries.value = entries.filter((entry) => entry.amount >= 0)
  }
})

const getTotalCredits = computed(() => {
  return getMoneyString(totalCredits.value)
})
const getTotalDebits = computed(() => {
  return getMoneyString(totalDebits.value)
})

const getEndBalance = computed(() => {
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
  creditEntries.value.forEach((e) => {
    if (e.cleared) {
      totalCredits.value += e.amount
    }
  })
}
function checkBoxChangedDebit() {
  console.log('checkBoxChangedDebit()')
  totalDebits.value = 0
  debitEntries.value.forEach((e) => {
    if (e.cleared) {
      totalDebits.value += e.amount
    }
  })
}
</script>

<style scoped>
.reconcile-card {
  width: 90%;
}

.reconcile-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
}

.reconcile-lists {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.credits {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 50%;
  padding: 0.5rem;
  border: 1px solid black;
}
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
}

.reconcile-summary {
  border: 1px solid black;
  /* width: 80%; */
  padding: 2rem;
  text-align: center;
}

#payee {
  margin: 5px;
  padding: 0 1rem;
}
#amount {
  margin: 0;
  padding: 0;
}
#difference {
  padding: 1rem 0 0 0;
  border-top: 2px solid black;
}
</style>
