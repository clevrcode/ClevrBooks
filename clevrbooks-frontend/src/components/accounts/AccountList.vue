<template>
  <ul>
    <p class="acctype-header" v-if="bankingAccounts.length > 0">Banking</p>
    <account-item
      v-for="acc in bankingAccounts"
      :key="acc.id"
      :id="acc.id"
      :name="acc.name"
      :balance="acc.currentBalance"
    ></account-item>
    <p class="acctype-header" v-if="savingAccounts.length > 0">Saving</p>
    <account-item
      v-for="acc in savingAccounts"
      :key="acc.id"
      :id="acc.id"
      :name="acc.name"
      :balance="acc.currentBalance"
    ></account-item>
    <p class="acctype-header" v-if="creditAccounts.length > 0">Credit-Card</p>
    <account-item
      v-for="acc in creditAccounts"
      :key="acc.id"
      :id="acc.id"
      :name="acc.name"
      :balance="acc.currentBalance"
    ></account-item>
    <p class="acctype-header" v-if="investingAccounts.length > 0">Investing</p>
    <account-item
      v-for="acc in investingAccounts"
      :key="acc.id"
      :id="acc.id"
      :name="acc.name"
      :balance="acc.currentBalance"
    ></account-item>
    <p class="acctype-header" v-if="businessAccounts.length > 0">Business</p>
    <account-item
      v-for="acc in businessAccounts"
      :key="acc.id"
      :id="acc.id"
      :name="acc.name"
      :balance="acc.currentBalance"
    ></account-item>
    <p class="acctype-header" v-if="assetAccounts.length > 0">Misc</p>
    <account-item
      v-for="acc in assetAccounts"
      :key="acc.id"
      :id="acc.id"
      :name="acc.name"
      :balance="acc.currentBalance"
    ></account-item>
    <p class="acctype-header" v-if="miscAccounts.length > 0">Misc</p>
    <account-item
      v-for="acc in miscAccounts"
      :key="acc.id"
      :id="acc.id"
      :name="acc.name"
      :balance="acc.currentBalance"
    ></account-item>
  </ul>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import AccountItem from '../../components/accounts/AccountItem.vue'

const store = useStore()

// const accounts = computed(() => {
//     return store.getters['accounts/accounts']
// })

const bankingAccounts = computed(() => {
  return store.getters['accounts/accounts'].filter(
    (acc) => acc.type === 'Banking',
  )
})
const creditAccounts = computed(() => {
  return store.getters['accounts/accounts'].filter(
    (acc) => acc.type === 'Credit-Card',
  )
})
const investingAccounts = computed(() => {
  return store.getters['accounts/accounts'].filter(
    (acc) => acc.type === 'Investing',
  )
})
const savingAccounts = computed(() => {
  return store.getters['accounts/accounts'].filter(
    (acc) => acc.type === 'Saving',
  )
})
const businessAccounts = computed(() => {
  return store.getters['accounts/accounts'].filter(
    (acc) => acc.type === 'Business',
  )
})
const assetAccounts = computed(() => {
  return store.getters['accounts/accounts'].filter(
    (acc) => acc.type === 'Asset',
  )
})
const miscAccounts = computed(() => {
  return store.getters['accounts/accounts'].filter(
    (acc) => acc.type === 'Miscellaneous',
  )
})
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0.3rem;
  margin: 0;
}

.acctype-header {
  font-size: 1.2rem;
  background: black;
  color: white;
}
</style>
