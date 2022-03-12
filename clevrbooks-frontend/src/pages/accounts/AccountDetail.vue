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

<script>
export default {
    props: ['id'],
    data() {
        return {
            selectedAccount: null
        }
    },
    computed: {
        accName() {
            return this.selectedAccount.name
        },
        description() {
            return this.selectedAccount.description
        },
        initBalance() {
            // let balance = this.selectedAccount.initBalance
            // if (balance > -0.009 || balance < 0.009) {
            //     balance = 0.0
            // }
            return this.selectedAccount.initBalance.toFixed(2)
        },
        isInitBalanceNegative() {
            return this.selectedAccount.initBalance < 0.0
        },
        currBalance() {
            return this.selectedAccount.currentBalance.toFixed(2)
        },
        isCurrBalanceNegative() {
            return this.selectedAccount.currentBalance < 0.0
        },
        currency() {
            return this.selectedAccount.currency
        },
        lastReconcile() {
            if (this.selectedAccount.reconcileAt) {
                const reconcileTime = new Date(this.selectedAccount.reconcileAt)
                return reconcileTime.toDateString()
            }
            return 'No Date'
        }
    },
    created() {
        const accounts = this.$store.getters['accounts/accounts']
        this.selectedAccount = accounts.find(acc => acc.id === parseInt(this.id))
    }
}
</script>

<style scoped>

.negative {
    color: red;
}

</style>