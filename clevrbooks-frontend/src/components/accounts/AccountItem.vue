<template>
    <!-- <li @click="accountEntries"> -->
    <li>
        <h3>{{ name }}</h3>
        <h4 :class="{negative: balanceIsNegative}">${{ currentBalance }}</h4>
        <div class="actions">
            <base-button link :to="accountEntriesLink">View Entries</base-button>
            <base-button link :to="accountDetailsLink">View Details</base-button>
        </div>
    </li>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  const props = defineProps(['id', 'name', 'balance'])

  const accountDetailsLink = computed(() => {
    return route.path + '/' + props.id
    // return { name: 'accountdetail', params: { id: this.id } }
  })

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
li {
  margin: 1rem 0;
  border: 1px solid #424242;
  border-radius: 12px;
  padding: 1rem;
}

h3 {
  font-size: 1.5rem;
}

h3,
h4 {
  margin: 0.5rem 0;
}
div {
  margin: 0.5rem 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.negative {
    color: red;
}

</style>