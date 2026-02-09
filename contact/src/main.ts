import './assets/main.css'
import './assets/global-bg-fix.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";

import ElementPlus from 'element-plus'
// import 'element-plus/dist.en.en/index.css'
import 'element-plus/dist/index.css'

import { createI18n } from 'vue-i18n'
import loadLocaleMessages from "./assets/logic/i18n";
const i18n = createI18n({
    legacy: false,
    locale: 'zh',
    fallbackLocale: 'zh',
    messages: loadLocaleMessages()
})

const app = createApp(App)

app.use(ElementPlus)

app.use(router)
    .use(i18n)
app.mount('#app')
