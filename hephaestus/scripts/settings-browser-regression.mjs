// Isolated UI validation. API responses are fixtures; no business data is changed.
import { execFileSync } from 'node:child_process'
const cli = (...args) => execFileSync('chrome-devtools', args, { encoding: 'utf8' })
const opened = cli('new_page', 'http://localhost:15173/invoice', '--isolatedContext', `heph-preferences-${Date.now()}`)
const page = opened.match(/^(\d+):.*\[selected\]/m)?.[1]
if (!page) throw new Error(opened)
const evaluate = fn => {
  const result = cli('evaluate_script', String(fn), '--pageId', page)
  if (!result.includes('"passed":true')) throw new Error(result)
  return result
}
try {
  console.log(evaluate(async () => {
    const app = document.querySelector('#app').__vue_app__
    const router = app.config.globalProperties.$router
    const settings = app.config.globalProperties.$pinia._s.get('settings')
    const resource = performance.getEntriesByType('resource').map(x => x.name).find(x => x.includes('/src/api/axiosInstance.ts'))
    const { default: api } = await import(resource || '/src/api/axiosInstance.ts')
    const check = (ok, label) => { if (!ok) throw new Error(label) }
    const until = async predicate => {
      for (let i = 0; i < 100; i++) {
        if (predicate()) return
        await new Promise(resolve => setTimeout(resolve, 30))
      }
      throw new Error('UI did not update')
    }
    const requests = []
    api.defaults.adapter = async config => {
      requests.push({ url: config.url, params: config.params })
      let data
      if (config.url === '/v1/session') data = { owner_id: 'preferences-fixture', display_name: 'Fixture', csrf_token: 'fixture', expires_at: '2099-01-01T00:00:00Z' }
      else if (config.url === '/v1/income-summary') {
        const tax = config.params.rate_bps
        data = { gross_cents: '10000', tax_estimate_cents: String(tax), net_estimate_cents: String(10000 - tax), known_expense_cents: '0', known_cash_estimate_cents: String(10000 - tax), record_count: 1, pending_wage_count: 0, unknown_expense_count: 0, duration_minutes: 60, confirmed_duration_minutes: 60, is_complete: true }
      } else if (config.url === '/v1/imports/new-fixture') data = { id: 'new-fixture', status: 'awaiting_review', version: '1', sheets: ['CSV'], row_count: 0 }
      else data = { items: [], next_cursor: '' }
      return { data, status: 200, statusText: 'OK', headers: {}, config }
    }
    window.preferencesRouter = router
    window.preferencesSettings = settings
    const headings = { zh: '外观与语言', en: 'Appearance & language', ja: '表示と言語', ko: '화면 및 언어' }
    for (const language of ['en', 'zh', 'ja', 'ko']) {
      settings.setLanguage(language)
      await router.push('/settings')
      await until(() => document.querySelector('h2')?.textContent === headings[language])
      check(!/settings\.|ui\.|currencies\./.test(document.querySelector('main').innerText), 'Unresolved translation')
      if (language !== 'en') check(!/Accounting defaults|Default withholding|Appearance & language/.test(document.querySelector('main').innerText), 'English fallback')
      await router.push('/dashboard')
      await until(() => document.querySelector('.summary-grid'))
      check(!document.querySelector('[role="slider"]'), 'Dashboard must not display tax slider')
      if (language !== 'en') check(!/Income overview|Net wages|Last updated|YOUR FINANCES|WORKSPACE/.test(document.body.innerText), 'Bilingual dashboard fallback')
    }
    await router.push('/settings')
    const input = document.querySelector('#settings-rate')
    input.value = '35'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    input.dispatchEvent(new Event('blur', { bubbles: true }))
    await until(() => settings.defaultRatePercent === 35)
    check(JSON.parse(localStorage.getItem('hephaestus.settings.v1')).defaultRatePercent === 35, 'Rate not persisted')
    await router.push('/dashboard')
    await until(() => requests.some(x => x.url === '/v1/income-summary' && x.params.rate_bps === 3500))
    await until(() => document.querySelector('.summary-grid').textContent.includes('65.00'))
    settings.setDefaultDateFormat('dmy')
    await router.push('/imports/new-fixture')
    await until(() => document.querySelector('.import-detail-page'))
    let instance = document.querySelector('.import-detail-page').__vueParentComponent
    while (instance && instance.type.__name !== 'ImportDetailPage') instance = instance.parent
    check(instance.setupState.mapping.date_format === 'dmy', 'Import does not use preferred date format')
    await router.push('/settings')
    settings.setTheme('light')
    settings.setLanguage('en')
    return { passed: true, checks: 'Four languages, no dashboard slider, rate input persistence and request, ordinary estimate, import date default' }
  }))
  for (const width of [390, 1024, 1440]) {
    cli('emulate', page, '--viewport', `${width}x900x1`)
    console.log(evaluate(async () => {
      const sleep = () => new Promise(resolve => setTimeout(resolve, 60))
      for (const language of ['en', 'zh', 'ja', 'ko']) {
        window.preferencesSettings.setLanguage(language)
        await sleep()
        if (document.documentElement.scrollWidth > window.innerWidth) throw new Error(`Overflow at ${window.innerWidth}, ${language}`)
      }
      const rect = document.querySelector('.day-night-toggle-container').getBoundingClientRect()
      if (rect.width > 46 || rect.height > 19) throw new Error('Theme graphic too large')
      const trigger = document.querySelector('.el-dropdown-link').getBoundingClientRect()
      if (trigger.width > 40 || trigger.height > 40) throw new Error('Language control too large')
      return { passed: true, width: innerWidth, theme: { width: rect.width, height: rect.height } }
    }))
  }
  console.log(evaluate(async () => {
    window.preferencesSettings.setLanguage('en')
    window.preferencesSettings.setTheme('dark')
    await new Promise(resolve => setTimeout(resolve, 100))
    if (document.documentElement.dataset.theme !== 'dark') throw new Error('Dark mode not applied')
    return { passed: true, darkMode: true }
  }))
  cli('take_screenshot', page, '--filePath', '/tmp/hephaestus-settings-dark.png')
} finally {
  cli('close_page', page)
}
