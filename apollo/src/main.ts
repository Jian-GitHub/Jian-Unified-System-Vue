import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'

function loadLocaleMessages() {
    const locales = import.meta.glob('./locales/*/*.json', { eager: true })
    const messages: Record<string, any> = {}

    for (const path in locales) {
        const matched = path.match(/locales\/([^\/]+)\/(.+)\.json$/)
        if (matched) {
            const lang = matched[1] // 语言代码，如 zh// 文件名（作为命名空间）

            // 初始化语言对象
            if (!messages[lang]) {
                messages[lang] = {}
            }

            // 合并文件内容到对应的语言
            const content = (locales[path] as any).default || locales[path]
            messages[lang] = { ...messages[lang], ...content }
        }
    }
    return messages
}

const i18n = createI18n({
    locale: 'zh',   // 默认语言
    fallbackLocale: 'zh',
    globalInjection: true, // 全局注入 $t 方法
    messages: loadLocaleMessages()
})

createApp(App).use(i18n).mount('#app')
