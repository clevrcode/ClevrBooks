<template>
  <div>
    <h1>Entries...</h1>
    <base-dialog :show="!!errorMsg" title="An error occured!" @close="handleError">
      <p>{{ errorMsg }}</p>
    </base-dialog>
    <section>
      <base-card>
        <div v-if="isLoading">
          <base-spinner></base-spinner>
        </div>
        <div class="scroll" v-else-if="hasEntries" >
          <ul>
              <entry-item v-for="entry in entries" :key="entry.data.id" :entry="entry.data" :balance="entry.balance">
              </entry-item>
          </ul>
        </div>
        <div v-else>
          <h3>No Entries For This Account</h3>
        </div>
      </base-card>
    </section>
  </div>

</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import EntryItem from '../../components/accounts/EntryItem.vue'

  const props = defineProps(['id'])
  const store = useStore()
  const isLoading = ref(false)
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

  // function showAmount(amnt) {
  //   return amnt.toFixed(2)
  // }

  async function loadEntries() {
      // console.log('loadEntries()')
      isLoading.value = true
      try {
          await store.dispatch('accounts/getEntriesForAccount', { id: props.id, order: 'ASC', limit: 0 })
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
    loadEntries()
  })

</script>

<style scoped>
ul {
  list-style: none;
}

li {
  text-decoration: false;
}

.scroll {
  background-color: #88f188;
  overflow-y: auto; 
  height: 800px;
}
</style>