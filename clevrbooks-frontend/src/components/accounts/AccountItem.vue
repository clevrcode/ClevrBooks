<template>
    <li>
        <div class="account-item">
            <router-link :to="accountEntriesLink">{{ name }}</router-link>
            <!-- <a :href="accountEntriesLink">{{ name }}</a> -->
            <div class="acc-balance" :class="{negative: balanceIsNegative}">${{ currentBalance }}</div>
        </div>
    </li>
</template>

<script setup>
  import { computed } from 'vue'

  // import { useRoute } from 'vue-router'
  // const route = useRoute()

  const props = defineProps(['id', 'name', 'balance'])

  // const accountDetailsLink = computed(() => {
  //   return route.path + '/' + props.id
  //   // return { name: 'accountdetail', params: { id: this.id } }
  // })

  const accountEntriesLink = computed(() => {
    return '/entries/' + props.id
  })
  
  const currentBalance = computed(() => {
    if (props.balance > -0.01 && props.balance < 0.01) {
      return "0.00"
    }
    // return this.balance.toFixed(2)
    return props.balance.toLocaleString()
  })

  const balanceIsNegative = computed(() => {
    return props.balance <= -0.01
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