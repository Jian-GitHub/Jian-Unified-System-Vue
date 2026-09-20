import './assets/css/main.css'
// Programmatic services are not discovered by the template component resolver.
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from './i18n'

import App from './App.vue'
import router from './router'

import { useSessionStore } from '@/store/session'
import { useSettingsStore } from '@/store/settings'
import { bindSessionAccessor, bindAccessErrorHandler } from '@/api/axiosInstance'

const app = createApp(App)
const pinia = createPinia()
// Pinia must be installed BEFORE any store is read — install it first.
app.use(pinia)

// Session accessor must be registered before any axios call fires.
bindSessionAccessor(() => useSessionStore())
bindAccessErrorHandler((status) => {
  const route = router.currentRoute.value
  if (route.meta.requiresAuth) router.replace({ name: 'auth-error', query: { reason: status === 403 ? 'denied' : 'expired', from: route.fullPath } })
})

// Now that Pinia is active, build the i18n instance from persisted settings.
const settings = useSettingsStore()
i18n.global.locale.value = settings.language

app.use(i18n)
app.use(router)

app.mount('#app')
