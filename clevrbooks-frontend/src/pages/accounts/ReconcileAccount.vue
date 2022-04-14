<template>
  <div class="reconcile-page">
    <div class="account-header" @click="toggleInit">
      <p class="account-header__name">{{ currentAccountName }}</p>
    </div>
    <div v-if="!initialized">
      <base-card>
        <label for="report-date">Report Date:</label>
        <input
          type="date"
          id="report-date"
          v-model.trim="reportDate"
          data-lpignore="true"
        />
        <label for="ending-balance">Ending Balance:</label>
        <input type="text" id="ending-balance" data-lpignore="true" />
      </base-card>
    </div>
    <div v-else>
      <h1>Initialized</h1>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import AutoNumeric from 'autonumeric'

const store = useStore()
const props = defineProps(['id'])

const reportDate = ref(new Date().toLocaleString().substring(0, 10))
const initialized = ref(false)

onMounted(() => {
  console.log('ReconcileAccount:onMounted()')
  if (!initialized.value) {
    new AutoNumeric('#ending-balance', { currencySymbol: '$' })
  }
})

function toggleInit() {
  initialized.value = !initialized.value
}

const currentAccountName = computed(() => {
  const account = store.getters['accounts/getAccountById'](parseInt(props.id))
  return account ? account.name : 'Undefined'
})
</script>

<style scoped>
.account-header {
  display: flex;
  background: #ddd;
  justify-content: space-between;
  align-items: center;
}

.account-header__name {
  margin: 0;
  font-size: 2rem;
}
</style>
