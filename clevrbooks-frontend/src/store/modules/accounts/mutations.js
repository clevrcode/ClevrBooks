export default {
    setAccounts(state, payload) {
        state.accounts = payload
    },
    setEntries(state, payload) {
        state.entries = payload
    },
    setCategories(state, payload) {
        for (const cat of payload.categories) {
            state.categories[cat.id] = { name: cat.name, type: cat.type }
        }
        // console.log(state.categories)
        for (const subcat of payload.subcategories) {
            state.subcategories[subcat.id] = { name: subcat.name, category: subcat.category }
        }
        // console.log(state.subcategories)
    }
}