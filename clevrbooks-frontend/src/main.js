import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Global components
import BaseCard from './components/ui/BaseCard.vue'
import BaseButton from './components/ui/BaseButton.vue'
import BaseSpinner from './components/ui/BaseSpinner.vue'
import BaseDialog from './components/ui/BaseDialog.vue'
// import BaseBadge from './components/ui/BaseBadge.vue'


const app = createApp(App)
app.use(router)
app.use(store)

app.component('base-card', BaseCard)
app.component('base-button', BaseButton)
app.component('base-spinner', BaseSpinner)
app.component('base-dialog', BaseDialog)
// app.component('base-badge', BaseBadge)

app.mount('#app')
