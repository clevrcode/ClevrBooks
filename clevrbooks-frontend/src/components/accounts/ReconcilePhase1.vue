<template>
  <base-card class="reconcile-container">
    <div class="reconcile-phase1">
      <div class="reconcile-phase1__item">
        <label for="report-date">Report Date:</label>
        <input
          type="date"
          id="report-date"
          v-model.trim="reportDate"
          data-lpignore="true"
        />
      </div>
      <div class="reconcile-phase1__item">
        <label for="ending-balance">Ending Balance:</label>
        <input type="text" id="ending-balance" data-lpignore="true" />
      </div>
      <div class="reconcile-phase1__item">
        <button @click="goPhase2">Continue</button>
        <button @click="cancel">Cancel</button>
      </div>
    </div>
  </base-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AutoNumeric from 'autonumeric'

const props = defineProps(['date'])
const emit = defineEmits(['next', 'cancel'])

const reportDate = ref(props.date)

onMounted(() => {
  console.log('ReconcilePhase1:onMounted()')
  new AutoNumeric('#ending-balance', { currencySymbol: '$' })
})

function goPhase2() {
  console.log('goPhase2()')
  // TODO: Validate entries
  const data = {
    date: reportDate.value,
    endBalance: AutoNumeric.getNumber('#ending-balance'),
  }
  emit('next', data)
}

function cancel() {
  console.log('cancel()')
  emit('cancel')
}
</script>

<style scoped>
.reconcile-container {
  width: 50%;
}

.reconcile-phase1 {
  padding: 2rem 0;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.reconcile-phase1__item {
  display: flex;
  flex-direction: column;
}
.reconcile-phase1__item button {
  padding: 5px;
  margin: 5px;
}
</style>
