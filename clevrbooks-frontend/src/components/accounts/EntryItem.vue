<template>
    <li class="entry_item">
        <span>{{entry.date}}</span>
        <span>{{entry.payee}}</span>
        <span>${{getAmount}}</span>
        <span>${{getBalance}}</span>
        <span>{{getCategory}}</span>
        <span>{{entry.memo}}</span>
        <div class="actions">
            <base-button @click="editEntry">Edit</base-button>
            <base-button @click="deleteEntry">Delete</base-button>
        </div>
    </li>
</template>

<script setup>
    import { computed } from 'vue'
    import { useStore } from 'vuex'

    // const route = useRoute()
    const store = useStore()

    const props = defineProps(['entry', 'balance'])

    const getBalance = computed(() => {
        return props.balance.toLocaleString()
    })

    const getAmount = computed(() => {
        return props.entry.amount.toLocaleString()
    })

    const getCategory = computed(() => {
        let category = ''
        if (props.entry.xferToAccount) {
            const account = store.getters['accounts/getAccountById'](props.entry.category).name
            category = '[' + account + ']'
        } else {
            category = store.getters['accounts/getCategoryById'](props.entry.category).name
            if (props.entry.subcategory) {
                const subcategory = store.getters['accounts/getSubcategoryById'](props.entry.subcategory)
                if (subcategory.category === props.entry.category) {
                    category += ':' + subcategory.name
                } else {
                    console.log(`Category mismatch ${category}(${props.entry.category}):${subcategory.name}(${props.entry.subcategory})`)
                }
            }
        }
        return category
    })

    function editEntry() {
        console.log("editEntry " + props.entry.payee)
    }

    function deleteEntry() {
        console.log("deleteEntry")
    }


</script>

<style scoped>

li {
  margin: 1rem 0;
  border: 1px solid #424242;
  border-radius: 12px;
  padding: 1rem;
}

.entry_item span {
    padding: 0 10px;
}

</style>