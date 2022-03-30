<template>
    <li>
        <div class="account-item">
            <router-link :to="accountEntriesLink">{{ name }}</router-link>
            <div class="acc-balance" :class="{negative: balanceIsNegative}">${{ currentBalance }}</div>
        </div>
    </li>
</template>

<script setup>
  import { computed } from 'vue'
  import useMoneyUtilities from '../../moneyUtilities'

  // import { useRoute } from 'vue-router'
  // const route = useRoute()

  const props = defineProps(['id', 'name', 'balance'])
  const { getMoneyString, isNegative } = useMoneyUtilities()

  // const accountDetailsLink = computed(() => {
  //   return route.path + '/' + props.id
  //   // return { name: 'accountdetail', params: { id: this.id } }
  // })

  const accountEntriesLink = computed(() => {
    return '/account/' + props.id
  })
  
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
a:hover {
    color: white;
}

.account-item {
    display: flex;
    margin: 0.5rem;
    flex-direction: row;
    justify-content: space-between;
}

.negative {
    color: red;
}

</style>