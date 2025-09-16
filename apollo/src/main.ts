import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import router from "./router"
import "element-plus/dist/index.css"
import "element-plus/theme-chalk/src/skeleton.scss"
import "element-plus/theme-chalk/src/skeleton-item.scss"

function loadLocaleMessages() {
    const locales = import.meta.glob('./locales/*/*/*.json', { eager: true })
    const messages: Record<string, any> = {}

    for (const path in locales) {
        const matched = path.match(/locales\/([^\/]+)\/(.+)\.json$/)
        if (matched) {
            const lang = matched[1]

            // init lang object
            if (!messages[lang]) {
                messages[lang] = {}
            }

            // *.json -> lang
            const content = (locales[path] as any).default || locales[path]
            messages[lang] = { ...messages[lang], ...content }
        }
    }
    return messages
}

const i18n = createI18n({
    legacy: false,
    locale: 'zh',
    fallbackLocale: 'zh',
    messages: loadLocaleMessages()
})

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

createApp(App)
    .use(pinia)
    .use(i18n)
    .use(router)
    .mount('#app')
