<template>
    <div>
        <base-dialog :show="!!errorMsg" title="An error occured!" @close="handleError">
            <p>{{ errorMsg }}</p>
        </base-dialog>
        <section>
            <base-card>
                <div class="controls">
                    <base-button mode="outline" @click="loadAccounts()">Refresh</base-button>
                </div>
                <div v-if="isLoading">
                    <base-spinner></base-spinner>
                </div>
                <ul v-else-if="hasAccounts">
                    <account-item v-for="acc in accounts" :key="acc.id"
                        :id="acc.id" :name="acc.name" :balance="acc.currentBalance">
                    </account-item>
                </ul>
                <h3 v-else>No Account Found</h3>
            </base-card>
        </section>  
    </div>
</template>

<script>
import AccountItem from '../../components/accounts/AccountItem.vue'

export default {
    components: {
        AccountItem
    },
    data() {
        return {
            isLoading: false,
            errorMsg: null
        }
    },
    computed: {
        accounts() {
            return this.$store.getters['accounts/accounts']
        },
        hasAccounts() {
            return !this.isLoading && this.$store.getters['accounts/hasAccounts']
        }
    },
    methods: {
        async loadAccounts() {
            this.isLoading = true
            try {
                await this.$store.dispatch('accounts/getAllAccounts')
            } catch (error) {
                this.errorMsg = error.message || 'Failed to load accounts'
            }
            this.isLoading = false
        },
        handleError() {
            this.errorMsg = null
        }
    },
    created() {
        this.loadAccounts()
    }
}
</script>

<style scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.controls {
  display: flex;
  justify-content: space-between;
}
</style>