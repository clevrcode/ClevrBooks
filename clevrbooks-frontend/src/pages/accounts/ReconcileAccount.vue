<template>
  <div class="reconcile-page">
    <div class="account-header">
      <p class="account-header__name">{{ currentAccountName }}</p>
    </div>
    <div v-if="!phase2">
      <KeepAlive>
        <reconcile-phase1
          @next="goPhase2"
          @cancel="cancel"
          :date="getDate"
        ></reconcile-phase1>
      </KeepAlive>
    </div>
    <div v-else>
      <reconcile-phase2
        :accountId="props.id"
        :data="reconcileData"
      ></reconcile-phase2>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import ReconcilePhase1 from '../../components/accounts/ReconcilePhase1.vue'
import ReconcilePhase2 from '../../components/accounts/ReconcilePhase2.vue'

const store = useStore()
const router = useRouter()

const props = defineProps(['id'])

const phase2 = ref(false)
const reconcileData = ref({})

function goPhase2(data) {
  console.log('goPhase2()')
  reconcileData.value = data
  phase2.value = true
}

function cancel() {
  router.back()
}

const currentAccountName = computed(() => {
  const account = store.getters['accounts/getAccountById'](parseInt(props.id))
  return account ? account.name : 'Undefined'
})

const getDate = computed(() => {
  return new Date().toLocaleString().substring(0, 10)
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
