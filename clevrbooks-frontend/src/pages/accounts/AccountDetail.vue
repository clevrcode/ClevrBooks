<template>
  <div>
      <section>
          <base-card v-if="!!selectedAccount">
            <h2>Name: {{ accName }}</h2>
            <h2>Description: {{ description }}</h2>
            <h4>Initial Balance: <span :class="{ negative: isInitBalanceNegative }"> ${{ initBalance }}</span></h4>
            <h4>Current Balance: <span :class="{ negative: isCurrBalanceNegative }"> ${{ currBalance }}</span></h4>
            <h4>Currency: {{ currency }}</h4>
            <h4>Last Reconciliation: {{ lastReconcile }}</h4>
          </base-card>
      </section>
  </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useStore } from 'vuex'

    const props = defineProps(['id'])
    const store = useStore()

    const selectedAccount = ref(null)

    const accName = computed(() => {
        return selectedAccount.value ? selectedAccount.value.name : 'UNDEFINED'
    })

    const description = computed(() => {
        return selectedAccount.value ? selectedAccount.value.description : ''
    })

    const initBalance = computed(() => {
        // return this.selectedAccount.value.initBalance.toFixed(2)
        return selectedAccount.value ? selectedAccount.value.initBalance.toLocaleString() : "0.00"
    })
    
    const isInitBalanceNegative = computed(() => {
        return selectedAccount.value ? selectedAccount.value.initBalance < 0.0 : false
    })

    const currBalance = computed(() => {
        // return this.selectedAccount.value.currentBalance.toFixed(2)
        return selectedAccount.value ? selectedAccount.value.currentBalance.toLocaleString() : "0.0"
    })

    const isCurrBalanceNegative = computed(() => {
        return selectedAccount.value ? selectedAccount.value.currentBalance < 0.0 : "false"
    })

    const currency = computed(() => {
        return selectedAccount.value ? selectedAccount.value.currency : "---"
    })

    const lastReconcile = computed(() => {
        if (selectedAccount.value && selectedAccount.value.reconcileAt) {
            return new Date(selectedAccount.value.reconcileAt).toDateString()
        }
        return 'No Date'
    })

    onMounted(() => {
        // console.log(`AccountDetail.onMounted(${props.id})`)
        selectedAccount.value = store.getters['accounts/getAccountById'](parseInt(props.id))
        // console.log(selectedAccount.value)
    })
</script>

<style scoped>

.negative {
    color: red;
}

</style>