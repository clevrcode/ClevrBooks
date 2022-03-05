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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import AccountItem from '../../components/accounts/AccountItem.vue'

const store = useStore()
const isLoading = ref(false)
const errorMsg = ref(null)

const accounts = computed(() => {
    return store.getters['accounts/accounts']
})

const hasAccounts = computed(() => {
    return !isLoading.value && store.getters['accounts/hasAccounts']
})

async function loadAccounts() {
    // console.log('loadAccounts()')
    isLoading.value = true
    try {
        await store.dispatch('accounts/getAllAccounts')
    } catch (err) {
        errorMsg.value = err.message || 'Failed to load accounts'
    }
    isLoading.value = false
}

function handleError() {
    errorMsg.value = null
}

onMounted(() => loadAccounts())

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