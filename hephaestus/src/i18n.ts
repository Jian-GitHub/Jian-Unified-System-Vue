import { createI18n } from 'vue-i18n'

const messages = import.meta.glob('./locales/*/common.json', { eager: true }) as Record<string, any>

function loadLocaleMessages(): Record<string, any> {
  const out: Record<string, any> = {}
  for (const path in messages) {
    const match = path.match(/locales\/([^/]+)\/common\.json$/)
    if (match) {
      const lang = match[1]
      out[lang] = (messages[path] as any).default ?? messages[path]
    }
  }
  return out
}

export const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: loadLocaleMessages() })
