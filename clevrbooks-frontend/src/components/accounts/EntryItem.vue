<template>
    <li class="entry_item">
        <div class="entry-grid">
            <div class="date">{{entry.date}}</div>
            <div class="payee">{{entry.payee}}</div>
            <div class="charge">{{getCharge}}</div>
            <div class="checked">{{getChecked}}</div>
            <div class="payment">{{getPayment}}</div>
            <div class="amount">{{getAmount}}</div>
            <div class="balance">{{getBalance}}</div>
            <div class="category">{{getCategory}}</div>
            <div class="memo">{{entry.memo}}</div>
            <button class="edit" @click="editEntry">Edit</button>
            <button class="delete" @click="deleteEntry">Delete</button>
        </div>
    </li>
</template>

<script setup>
    import { computed } from 'vue'
    import { useStore } from 'vuex'

    // const route = useRoute()
    const store = useStore()

    const props = defineProps(['entry', 'balance'])

    const getCharge = computed(() => {
        return props.entry.amount < 0 ? (-props.entry.amount).toLocaleString(undefined, {minimumFractionDigits: 2}) : ""
    })

    const getChecked = computed(() => {
        return props.entry.cleared ? "R" : ""
    })

    const getPayment = computed(() => {
        return props.entry.amount >= 0 ? props.entry.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : ""
    })

    const getAmount = computed(() => {
        return props.entry.amount.toLocaleString(undefined, {minimumFractionDigits: 2})
    })

    const getBalance = computed(() => {
        return props.balance.toLocaleString(undefined, {minimumFractionDigits: 2})
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
  margin: 0;
  border: 1px solid #424242;
  /* border-radius: 12px; */
  padding: 0;
  font-size: 1rem;
}

.entry_item span {
    padding: 0;
}

.entry-grid {
    display: grid;
    grid-template-columns: 6rem 12rem auto 6rem 1.5rem 6rem 6rem 6rem;
    grid-template-rows: 1.5rem 1.5rem;
    grid-template-areas: "date payee    payee charge checked payment amount bal"
                         ".    category memo  memo   memo    memo    edit   del";

}

.date {
    grid-area: date;
    border: 1px solid black;
    background-color: #d8fdf1;
}

.payee {
    grid-area: payee;
    border: 1px solid black;
    background-color: #d8fdf1;
}

.charge {
    text-align: end;
    grid-area: charge;
    border: 1px solid black;
    background-color: #ffd1d1;
}

.checked {
    text-align: center;
    grid-area: checked;
    border: 1px solid black;
}

.payment {
    text-align: end;
    grid-area: payment;
    border: 1px solid black;
    background-color: #d2fb9b;
}
.amount {
    text-align: end;
    grid-area: amount;
    border: 1px solid black;
}

.balance {
    text-align: end;
    grid-area: bal;
    border: 1px solid black;
}

.category {
    grid-area: category;
    border: 1px solid black;
}

.memo {
    grid-area: memo;
    border: 1px solid black;
    background-color: #faf9cb;
}

.edit {
    grid-area: edit;
}
.delete {
    grid-area: del;
}

</style>