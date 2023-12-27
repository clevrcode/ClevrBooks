<template>
  <li class="entry_item" :class="{ entrychecked: isEntryChecked }">
    <div :class="gridClass">
      <div class="date">{{ entry.date }}</div>
      <div class="check-number" v-if="props.banking">
        {{ entry.checkNumber }}
      </div>

      <div class="payee">{{ entry.payee }}</div>
      <div class="charge">{{ getCharge }}</div>
      <div class="checked">
        <span class="material-icons-outlined">{{ getChecked }}</span>
      </div>
      <div class="payment">{{ getPayment }}</div>
      <div class="amount">{{ getAmount }}</div>
      <div class="balance" :class="{ negative: balanceIsNegative }">
        {{ getBalance }}
      </div>
      <div class="entry-type">{{ entry.type }}</div>
      <div class="category" :class="{ xfer: entry.xferToAccount }">
        {{ entry.category }}
      </div>
      <div class="memo">{{ entry.memo }}</div>
      <button class="edit" @click="editEntry">Edit</button>
      <button class="delete" @click="deleteEntry">Delete</button>
    </div>
  </li>
</template>

<script setup>
import { computed } from 'vue'
// import { useStore } from 'vuex'
import useMoneyUtilities from '../../moneyUtilities'

const { getMoneyString, isNegative } = useMoneyUtilities()

// const route = useRoute()
// const store = useStore()

const emit = defineEmits(['edit', 'delete'])
const props = defineProps(['entry', 'balance', 'banking'])

const gridClass = computed(() => ({
  'entry-grid': !props.banking,
  'entry-grid-banking': props.banking,
}))

const getCharge = computed(() => {
  return props.entry.amount < 0 ? getMoneyString(-props.entry.amount) : ''
})

const getChecked = computed(() => {
  // display a checkmark or a black dot
  return props.entry.cleared ? 'check' : ''
})

const isEntryChecked = computed(() => {
  return props.entry.cleared
})

const getPayment = computed(() => {
  return props.entry.amount >= 0 ? getMoneyString(props.entry.amount) : ''
})

const getAmount = computed(() => {
  return getMoneyString(props.entry.amount)
})

const getBalance = computed(() => {
  return getMoneyString(props.balance)
})
const balanceIsNegative = computed(() => {
  return isNegative(props.balance)
})

function editEntry() {
  console.log('editEntry ' + props.entry)
  emit('edit', props.entry)
}

function deleteEntry() {
  console.log('deleteEntry ' + props.entry.payee)
  emit('delete', props.entry)
}
</script>

<style scoped>
li {
  margin: 0;
  border: 1px solid #424242;
  /* border-radius: 12px; */
  padding: 0;
  font-size: 1rem;
}

.entrychecked {
  color: #777;
}

.entry_item span {
  padding: 0;
}

.entry-grid {
  display: grid;
  grid-template-columns: 6rem 12rem auto 6rem 1.5rem 6rem 6rem 6rem;
  grid-template-rows: 1.5rem 1.5rem;
  grid-template-areas:
    'date payee    payee charge checked payment amount bal'
    'type category memo  memo   memo    memo    edit   del';
}

.entry-grid-banking {
  display: grid;
  grid-template-columns: 6rem 4rem 12rem auto 6rem 1.5rem 6rem 6rem 6rem;
  grid-template-rows: 1.5rem 1.5rem;
  grid-template-areas:
    'date chk      payee     payee charge checked payment amount bal'
    'type category category  memo  memo   memo    memo    edit   del';
}

.check-number {
  grid-area: chk;
  text-align: center;
  border: 1px solid black;
  background-color: white;
}

.entry-type {
  grid-area: type;
  text-align: center;
  border: 1px solid black;
  background-color: white;
}

.date {
  grid-area: date;
  border: 1px solid black;
  background-color: #d8fdf1;
}

.payee {
  grid-area: payee;
  border: 1px solid black;
  background-color: #d8fdf1;
}

.charge {
  text-align: end;
  grid-area: charge;
  border: 1px solid black;
  background-color: #ffd1d1;
}

.checked {
  text-align: center;
  grid-area: checked;
  border: 1px solid black;
  color: black;
}

.payment {
  text-align: end;
  grid-area: payment;
  border: 1px solid black;
  background-color: #d2fb9b;
}
.amount {
  text-align: end;
  grid-area: amount;
  border: 1px solid black;
}

.balance {
  text-align: end;
  grid-area: bal;
  border: 1px solid black;
}

.category {
  grid-area: category;
  border: 1px solid black;
}

.xfer {
  background: greenyellow;
}

.memo {
  grid-area: memo;
  border: 1px solid black;
  background-color: #faf9cb;
}

.negative {
  color: red;
}

.edit {
  grid-area: edit;
}
.delete {
  grid-area: del;
}
</style>
