import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { setSessionHandlers } from './services/api'
import { createSessionRedirects } from './router/sessionRedirects'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore(pinia)

setSessionHandlers(createSessionRedirects(router, authStore))

await authStore.fetchCurrentUser()

app.use(router)

app.mount('#app')