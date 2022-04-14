<template>
  <li>
    <div class="account-item" @click="openAccount">
      <!-- <router-link :to="accountEntriesLink">{{ name }}</router-link> -->
      <p class="acc-name">{{ name }}</p>
      <div class="acc-balance" :class="{ negative: balanceIsNegative }">
        ${{ currentBalance }}
      </div>
    </div>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import useMoneyUtilities from '../../moneyUtilities'

const router = useRouter()

// import { useRoute } from 'vue-router'
// const route = useRoute()

const props = defineProps(['id', 'name', 'balance'])
const { getMoneyString, isNegative } = useMoneyUtilities()

// const accountDetailsLink = computed(() => {
//   return route.path + '/' + props.id
//   // return { name: 'accountdetail', params: { id: this.id } }
// })
function openAccount() {
  router.push('/account/' + props.id)
}

// const accountEntriesLink = computed(() => {
//   return '/account/' + props.id
// })

const currentBalance = computed(() => {
  return getMoneyString(props.balance)
})

const balanceIsNegative = computed(() => {
  return isNegative(props.balance)
})
</script>

<style scoped>
a {
  color: black;
  text-decoration: none;
}

.account-item:hover {
  background: white;
  cursor: pointer;
}

.account-item {
  color: black;
  display: flex;
  margin: 0.5rem;
  flex-direction: row;
  justify-content: space-between;
}

.acc-name {
  margin: 0;
}
.negative {
  color: red;
}
</style>
