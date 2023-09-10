<template>
  <div ref="mainWnd">
    <base-dialog
      :show="!!errorMsg"
      title="An error occured!"
      @close="handleError"
    >
      <p>{{ errorMsg }}</p>
    </base-dialog>
    <section>
      <transition name="form">
        <entry-form
          class="entry-form"
          v-if="showForm"
          @cancel="canClose"
          @submit="insertEntry"
          :banking="isBankingAccount"
          :accountId="+props.id"
        ></entry-form>
      </transition>
      <!-- Add EDIT ENTRY dialog -->
      <transition name="form">
        <entry-form
          class="entry-form"
          v-if="showEditForm"
          @cancel="canClose"
          @submit="updateEntry"
          :editForm="isEditForm"
          :banking="isBankingAccount"
          :id="editFormData.id"
          :checkNumber="editFormData.checkNumber"
          :type="editFormData.type"
          :accountId="editFormData.accountId"
          :date="editFormData.date"
          :payee="editFormData.payee"
          :amount="editFormData.amount"
          :memo="editFormData.memo"
          :category="editFormData.category"
          :xferToAccount="editFormData.xferToAccount === 1"
        ></entry-form>
      </transition>
      <div class="spinner" v-if="isLoading">
        <base-spinner></base-spinner>
      </div>
      <div class="ledger" div="ledger" v-else-if="hasEntries">
        <div class="account-header">
          <p class="account-header__name">{{ currentAccountName }}</p>
          <div class="account-header__filters">
            <div class="account-header__action" @click="reconcileAccount">
              <span class="material-icons-outlined">inventory</span>
            </div>
            <div class="account-header__action" @click="addEntry">
              <span class="material-icons-outlined">add</span>
            </div>
            <div class="account-header__filter-dates">
              <select name="datefilter" id="date-select" v-model="selected">
                <option
                  v-for="option in options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="account-header__search">
              <span class="material-icons-outlined">search</span>
              <input
                id="search"
                name="Search"
                type="search"
                v-model.trim="searchEntry"
                autocomplete="search"
              />
            </div>
          </div>
        </div>
        <ul ref="ledgerWnd">
          <entry-item
            class="entry-table"
            v-for="entry in entries"
            :key="entry.data.id"
            v-memo="[entry.id === entryUpdated]"
            :entry="entry.data"
            :balance="entry.balance"
            :banking="isBankingAccount"
            @edit="editEntry"
            @delete="deleteEntry"
          ></entry-item>
        </ul>
      </div>
      <div v-else>
        <h3>No Entries For This Account</h3>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

import EntryItem from '../../components/accounts/EntryItem.vue'
import EntryForm from '../../components/accounts/AddEntryForm.vue'

const props = defineProps(['id'])
const store = useStore()
const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const errorMsg = ref(null)
const searchEntry = ref('')
const allEntries = ref([])
const selected = ref('')
const startDate = ref(null)
const endDate = ref(null)
const showForm = ref(false)
const showEditForm = ref(false)
const mainWnd = ref(null)
const ledgerWnd = ref(null)
const editFormData = ref({})
const entryUpdated = ref(-1)

const options = ref([
  { value: '', text: '--All Dates--' },
  { value: 'thismonth', text: 'This Month' },
  { value: 'lastmonth', text: 'Last Month' },
  { value: '30days', text: 'Last 30 Days' },
  { value: '60days', text: 'Last 60 Days' },
  { value: '90days', text: 'Last 90 Days' },
  { value: '12month', text: 'Last 12 Months' },
  { value: 'thisquarter', text: 'This Quarter' },
  { value: 'lastquarter', text: 'Last Quarter' },
  { value: 'thisyear', text: 'This Year' },
  { value: 'lastyear', text: 'Last Year' },
  { value: 'custom', text: 'Custom...' },
])

const entries = computed(() => {
  const result = []
  // console.log("compute filtered entries")
  for (let entry of allEntries.value) {
    let pushEntry = true
    // First apply the date filter
    if (startDate.value) {
      // console.log('check start date')
      pushEntry = entry.data.date >= startDate.value
    }
    if (pushEntry && endDate.value) {
      // console.log('check end date')
      pushEntry = entry.data.date <= endDate.value
    }
    // Then, apply the search filter
    if (pushEntry && searchEntry.value.length > 0) {
      // console.log('check search filter')
      const searchkey = searchEntry.value.toLowerCase()
      pushEntry =
        entry.data.payee.toLowerCase().includes(searchkey) ||
        entry.data.memo.toLowerCase().includes(searchkey) ||
        entry.data.category.toLowerCase().includes(searchkey)
    }
    if (pushEntry) {
      // console.log('push entry')
      result.push({
        data: entry.data,
        balance: entry.balance,
      })
    }
  }
  return result
})

const hasEntries = computed(() => {
  return !isLoading.value && store.getters['accounts/hasEntries']
})

const currentAccountName = computed(() => {
  return store.getters['accounts/getCurrentAccountName']
})

const isEditForm = computed(() => {
  return true
})
const isBankingAccount = computed(() => {
  const type = store.getters['accounts/getCurrentAccountType']
  // console.log(`isBankingAccount(${type})`)
  return type === 'Banking'
})

// Reload entries when account param change
watch(
  () => route.params.id,
  (newId) => {
    if (typeof newId !== 'undefined') {
      searchEntry.value = ''
      startDate.value = null
      endDate.value = null
      selected.value = ''
      loadEntries(newId)
    }
  },
)

watch(selected, (newValue) => {
  const Quarters = [
    { start: '01-01', end: '03-31' },
    { start: '04-01', end: '06-30' },
    { start: '07-01', end: '09-30' },
    { start: '10-01', end: '12-31' },
  ]

  if (newValue.length > 0) {
    const date = new Date()
    // console.log(date.toLocaleString().substring(0,10))
    if (newValue === 'thismonth') {
      const sDate = new Date(date.getFullYear(), date.getMonth(), 1)
      startDate.value = sDate.toLocaleString().substring(0, 10)
      endDate.value = null
      // console.log(`startDate: ${startDate.value}`)
    } else if (newValue === 'lastmonth') {
      const month = ((date.getMonth() - 1 + 11) % 12) + 1
      const year = month === 12 ? date.getFullYear() - 1 : date.getFullYear()
      const sDate = new Date(year, month, 1)
      startDate.value = sDate.toLocaleString().substring(0, 10)
      const eDate = new Date(date.setDate(0))
      endDate.value = eDate.toLocaleString().substring(0, 10)
      // console.log(`start Date: ${startDate.value}`)
      // console.log(`end Date  : ${endDate.value}`)
    } else if (newValue === '30days') {
      const sDate = new Date(new Date().setDate(date.getDate() - 30))
      startDate.value = sDate.toLocaleString().substring(0, 10)
      endDate.value = null
      // console.log(`start Date: ${startDate.value}`)
    } else if (newValue === '60days') {
      const sDate = new Date(new Date().setDate(date.getDate() - 60))
      startDate.value = sDate.toLocaleString().substring(0, 10)
      endDate.value = null
      // console.log(`start Date: ${startDate.value}`)
    } else if (newValue === '90days') {
      const sDate = new Date(new Date().setDate(date.getDate() - 90))
      startDate.value = sDate.toLocaleString().substring(0, 10)
      endDate.value = null
      // console.log(`start Date: ${startDate.value}`)
    } else if (newValue === '12month') {
      const sDate = new Date(
        date.getFullYear() - 1,
        date.getMonth(),
        date.getDate(),
      )
      startDate.value = sDate.toLocaleString().substring(0, 10)
      endDate.value = null
      // console.log(`start Date: ${startDate.value}`)
    } else if (newValue === 'thisquarter') {
      const idx = Math.floor(date.getMonth() / 3)
      startDate.value = `${date.getFullYear()}-${Quarters[idx].start}`
      endDate.value = `${date.getFullYear()}-${Quarters[idx].end}`
      // console.log(`start Date: ${startDate.value}`)
      // console.log(`end Date  : ${endDate.value}`)
    } else if (newValue === 'lastquarter') {
      let idx = Math.floor(date.getMonth() / 3)
      const idx2 = (idx + 3) % 4
      const year = idx2 > idx ? date.getFullYear() - 1 : date.getFullYear()
      startDate.value = `${year}-${Quarters[idx2].start}`
      endDate.value = `${year}-${Quarters[idx2].end}`
      // console.log(`start Date: ${startDate.value}`)
      // console.log(`end Date  : ${endDate.value}`)
    } else if (newValue === 'thisyear') {
      const sDate = new Date(date.getFullYear(), 0, 1)
      startDate.value = sDate.toLocaleString().substring(0, 10)
      endDate.value = null
      // console.log(`start Date: ${startDate.value}`)
    } else if (newValue === 'lastyear') {
      const sDate = new Date(date.getFullYear() - 1, 0, 1)
      startDate.value = sDate.toLocaleString().substring(0, 10)
      endDate.value = new Date(new Date(date.getFullYear(), 0, 1).setDate(0))
        .toLocaleString()
        .substring(0, 10)
      // console.log(`start Date: ${startDate.value}`)
      // console.log(`end Date  : ${endDate.value}`)
    }
  } else {
    // console.log("no filter")
    startDate.value = null
    endDate.value = null
  }
})

function insertEntry(payload) {
  console.log('insertEntry in account: ' + payload.id)
}

function addEntry() {
  // console.log("addEntry()")
  showForm.value = true
}

function updateEntry(payload) {
  console.log('updateEntry in account:' + payload.id)
  showEditForm.value = false
  // if (payload.edit) {
  //   entryUpdated.value = payload.entry.id
  // }
}

function editEntry(entry) {
  editFormData.value = entry
  showEditForm.value = true
  console.log(editFormData.value)
}

function deleteEntry(entry) {
  console.log('deleteEntry()')
  const params = {
    id: props.id,
    entryId: entry.id,
  }
  store.dispatch('accounts/deleteEntry', params)
}

function canClose() {
  // console.log('canClose()')
  showForm.value = false
  showEditForm.value = false
}

function reconcileAccount() {
  console.log('reconcileAccount()')
  router.push('/reconcile/' + props.id)
}

function scrollDown() {
  // console.log(`ledgerWnd: ${ledgerWnd.value}`)
  if (ledgerWnd.value) {
    ledgerWnd.value.scrollTop = ledgerWnd.value.scrollHeight
  }
}

function getCategory(entry) {
  let category = ''
  if (entry.xferToAccount) {
    category = store.getters['accounts/getAccountById'](entry.category).name
  } else {
    category = store.getters['accounts/getCategoryName'](
      entry.category,
      entry.subcategory,
    )
  }
  return category
}

async function loadEntries(id) {
  isLoading.value = true
  allEntries.value = []
  try {
    await store.dispatch('accounts/getEntriesForAccount', {
      id,
      order: 'ASC',
      limit: 0,
    })
    let balance = 0.0
    for (let entry of store.getters['accounts/getEntries']) {
      balance += entry.amount
      const newEntry = entry
      newEntry.category = getCategory(entry)
      allEntries.value.push({
        data: newEntry,
        balance: balance,
      })
    }

    // console.log(`ledgerWnd: ${ledgerWnd.value}`)
    if (ledgerWnd.value) {
      ledgerWnd.value.scrollTop = ledgerWnd.value.scrollHeight + 120
    }
    setTimeout(function () {
      scrollDown()
    }, 1000)
  } catch (err) {
    errorMsg.value = err.message || 'Failed to load accounts'
  }
  isLoading.value = false
}

function handleError() {
  errorMsg.value = null
}

onMounted(() => {
  // console.log("AccountEntries: props=" + props.id)
  // console.log(route.params)
  loadEntries(props.id)
})
</script>

<style scoped>
@import 'material-icons/iconfont/material-icons.css';

section {
  height: 100%;
}

ul {
  list-style: none;
  margin: 1rem;
  padding: 0;
  overflow-y: auto;
}

.spinner {
  background-color: white;
  height: 100%;
}

.ledger {
  display: flex;
  flex-direction: column;
  background-color: white;
  height: 100%;
}

.account-header {
  display: flex;
  background: #ddd;
  justify-content: space-between;
  align-items: center;
}

.account-header__action {
  padding: 0 0.75rem;
}
.account-header__action:hover {
  cursor: pointer;
  background: white;
}

.account-header__filters {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.account-header__filter-dates {
  padding: 0 1rem;
}

.account-header__search {
  display: flex;
  align-items: center;
  padding: 0 1rem;
}

.account-header__name {
  margin: 0;
  /* text-align: center; */
  font-size: 2rem;
}

#search {
  width: 3rem;
}

#search:focus {
  width: 10rem;
}

/* #search + svg {
  visibility: hidden;
}
#search:placeholder-shown + svg {
  visibility: visible;
} */

.entry-form {
  position: absolute;
  top: 20%;
  right: 0%;
  width: 40%;
  z-index: 1;
}

.form-enter-from,
.form-leave-to {
  transform: translateX(100%);
}

.form-enter-active,
.form-leave-active {
  transition: transform 0.5s;
}

.form-enter-to {
  transform: translateX(0%);
}

.entry-table {
  margin: 0 0 1px 0;
}
</style>
