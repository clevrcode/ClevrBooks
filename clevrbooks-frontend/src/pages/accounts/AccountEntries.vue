<template>
  <div>
    <base-dialog :show="!!errorMsg" title="An error occured!" @close="handleError">
      <p>{{ errorMsg }}</p>
    </base-dialog>
    <section>
        <div class="spinner" v-if="isLoading">
          <base-spinner></base-spinner>
        </div>
        <div class="scroll" v-else-if="hasEntries" >
          <p class="account-header">{{ currentAccountName }}</p>
          <ul>
              <entry-item v-for="entry in entries" :key="entry.data.id" :entry="entry.data" :balance="entry.balance">
              </entry-item>
          </ul>
        </div>
        <div v-else>
          <h3>No Entries For This Account</h3>
        </div>
    </section>
  </div>

</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { useRoute } from 'vue-router'

  import EntryItem from '../../components/accounts/EntryItem.vue'

  const props = defineProps(['id'])
  const store = useStore()
  const route = useRoute()
  const isLoading = ref(true)
  const errorMsg = ref(null)

  const entries = computed(() => {
    const result = []
    let balance = 0.0
    for (let entry of store.getters['accounts/entries']) {
      balance += entry.amount
      result.push({
        data: entry,
        balance: balance
      })
    }
    return result
  })
  const hasEntries = computed(() => {
      return !isLoading.value && store.getters['accounts/hasEntries']
  })

  const currentAccountName = computed(() => {
    return store.getters['accounts/getCurrentAccountName']
  })
  
  // Reload entries when account param change
  watch(() => route.params.id,
      newId => {
        if (typeof newId !== 'undefined' ) {
          loadEntries(newId)
        }
      }
  )



  async function loadEntries(id) {
      isLoading.value = true
      try {
          await store.dispatch('accounts/getEntriesForAccount', { id, order: 'ASC', limit: 0 })
      } catch (err) {
          errorMsg.value = err.message || 'Failed to load accounts'
      }
      isLoading.value = false
  }

  function handleError() {
      errorMsg.value = null
  }

  onMounted(() => {
    // console.log("AccountEntries: props=" + props.id)
    // console.log(route.params)
    loadEntries(props.id)
  })

</script>

<style scoped>
section {
  height: 100%;
}

ul {
  list-style: none;
  margin: 1rem;
  padding: 0;
}

.spinner {
  background-color: white;
  height: 100%;
}

.scroll {
  background-color: white;
  overflow-y: auto; 
  height: 100%;
}

.account-header {
  text-align: center;
  font-size: 2rem;
}

</style>