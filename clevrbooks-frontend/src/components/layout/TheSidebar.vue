<template>
  <div>
    <account-list v-if="hasAccounts">
    </account-list>
  </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useStore } from 'vuex'
    import AccountList from '../accounts/AccountList.vue'

    const store = useStore()

    const hasAccounts = computed(() => {
        return store.getters['accounts/hasAccounts']
    })
    
</script>

<style scoped>

div {
    background: rgb(194, 180, 206);
    font-size: 1rem;
}

</style>