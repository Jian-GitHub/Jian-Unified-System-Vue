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

export default loadLocaleMessages;