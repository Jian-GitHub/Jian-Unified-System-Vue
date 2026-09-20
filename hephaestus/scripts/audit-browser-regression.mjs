// Uses the installed Chrome DevTools CLI and an isolated context. Every API
// request is intercepted in memory; no business records are read or written.
import { execFileSync } from 'node:child_process'

function cli(...args) {
  return execFileSync('chrome-devtools', args, { encoding: 'utf8' })
}
const opened = cli('new_page', 'http://localhost:15173/invoice', '--isolatedContext', `heph-audit-${Date.now()}`)
const pageId = opened.match(/^(\d+):.*\[selected\]/m)?.[1]
if (!pageId) throw new Error(opened)
cli('emulate', pageId, '--viewport', '1440x420x1')
try {
  const result = cli('evaluate_script', String(async () => {
    const check = (ok, message) => { if (!ok) throw new Error(message) }
    const until = async (predicate, label = 'UI') => {
      for (let i = 0; i < 150; i++) {
        if (predicate()) return
        await new Promise(resolve => setTimeout(resolve, 20))
      }
      throw new Error(`Timed out waiting for ${label}`)
    }
    const confirm = async pending => {
      await until(() => document.querySelector('.el-message-box__btns button:last-child'))
      // Element Plus ignores actions during the opening transition.
      await new Promise(resolve => setTimeout(resolve, 500))
      document.querySelector('.el-message-box__btns button:last-child').click()
      await Promise.race([pending, new Promise((_, reject) => setTimeout(() => reject(new Error('Confirmation did not finish')), 5000))])
      await until(() => !document.querySelector('.el-message-box'))
    }
    const app = document.querySelector('#app').__vue_app__
    const router = app.config.globalProperties.$router
    const resource = performance.getEntriesByType('resource').map(x => x.name).find(x => x.includes('/src/api/axiosInstance.ts'))
    const { default: api } = await import(resource || '/src/api/axiosInstance.ts')
    const record = id => ({ id, version: '4', source_id: '', overrides: [], archived: false, data: {
      service_date: '2026-09-16', customer: `Record ${id}`, job_type: 'Support', detail: '', note: '',
      pricing_category: '', duration_minutes: 60, team_size: 1, gross_cents: '10000', expense_cents: '0',
    } })
    const requests = []
    const summary = gross => ({ gross_cents: gross, tax_estimate_cents: '2000', net_estimate_cents: '8000', known_expense_cents: '0', known_cash_estimate_cents: '8000', record_count: 1, pending_wage_count: 0, unknown_expense_count: 0, duration_minutes: 60, confirmed_duration_minutes: 60, is_complete: true, calculation_version: 'test' })
    const batches = {}
    const batch = id => batches[id] ||= { id, source_id: '7', status: 'awaiting_review', version: '2',
      selection_hash: 'old', row_count: 1, error_count: 0, inserted: 0, updated: 0, unchanged: 0,
      excluded: 0, sheets: ['CSV'], created_at: '2026-09-16' }
    api.defaults.adapter = async config => {
      const { url, method } = config
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
      requests.push({ url, method, body, headers: { ...config.headers }, params: config.params })
      let data
      if (url === '/v1/session') data = { owner_id: 'audit', display_name: 'Audit fixture', csrf_token: 'fixture', expires_at: '2099-01-01T00:00:00Z' }
      else if (url === '/v1/income-summary') data = summary(config.params?.from ? '10000' : '999999')
      else if (url === '/v1/income-calendar' || url === '/v1/income-series') data = { items: [] }
      else if (url === '/v1/work-records' && method === 'post') data = record('created')
      else if (url === '/v1/work-records' && method === 'get') {
        if (config.params?.limit === 8) {
          const start = config.params?.cursor ? 8 : 0
          data = { items: Array.from({ length: start ? 2 : 8 }, (_, index) => record(`recent-${start + index + 1}`)), next_cursor: start ? '' : 'recent-cursor-8' }
        } else data = { items: [], next_cursor: '' }
      }
      else if (/^\/v1\/work-records\/[^/]+\/revisions$/.test(url)) data = { items: [] }
      else if (/^\/v1\/work-records\/[^/]+$/.test(url)) data = record(url.split('/').pop())
      else if (/^\/v1\/imports\//.test(url)) {
        const id = url.split('/')[3]
        const b = batch(id)
        if (url.endsWith('/sheet')) data = { sheet: 'CSV', items: [{ row: 1, cells: ['Date', 'Wage'] }], total: 1, next_cursor: '' }
        else if (url.endsWith('/rows')) data = { items: [{ row: 2, data: record('row').data,
          action: 'update', record_id: 'existing', expected_version: '4', errors: [] }], next_cursor: '' }
        else if (url.endsWith('/mapping')) {
          check(body.columns.some(c => c.field === 'service_date') && body.columns.some(c => c.field === 'gross'), 'Empty mappings must not reach backend')
          check(body.columns.every(c => c.field), 'Ignored columns must be omitted')
          check(config.headers['If-Match'] === '"2"', 'Mapping version mismatch')
          Object.assign(b, { version: '3', selection_hash: 'new', mapping: body })
          data = { ...b }
        } else if (url.endsWith('/commit')) {
          check(config.headers['If-Match'] === '"3"' && body.selection_hash === 'new', 'Commit must use refreshed preview')
          Object.assign(b, { status: 'committed', version: '4', updated: 1 })
          data = { ...b }
        } else data = { ...b }
      } else throw new Error(`Unexpected request ${method} ${url}`)
      return { data, status: 200, statusText: 'OK', headers: {}, config }
    }
    const component = (selector, name) => {
      let instance = document.querySelector(selector)?.__vueParentComponent
      while (instance && instance.type.__name !== name) instance = instance.parent
      return instance?.setupState
    }
    await router.push('/dashboard')
    await until(() => requests.filter(r => r.url === '/v1/income-summary').length >= 2)
    const summaries = requests.filter(r => r.url === '/v1/income-summary').slice(-2)
    const aucklandMonth = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit' }).format(new Date()).replace('/', '-')
    check(summaries.some(r => r.params?.from === `${aucklandMonth}-01` && r.params?.to), 'Dashboard must open on the current Auckland month')
    check(summaries.some(r => !r.params?.from && !r.params?.to), 'All-time total must use an independent unbounded summary')
    await until(() => document.querySelector('.all-time-total .animated-value')?.getAttribute('aria-label') === '$9,999.99', 'animated all-time total')
    check(document.querySelectorAll('.animated-value').length >= 8, 'Financial values must use the shared accessible count-up treatment')
    await until(() => document.querySelector('.page-header.heph-reveal.is-revealed'), 'dashboard reveal motion')
    check(document.querySelectorAll('.summary-grid .heph-stat.heph-spotlight').length === 4, 'Summary cards must expose consistent spotlight interaction')
    check(document.querySelector('.trend-panel.heph-spotlight') && document.querySelector('.recent-panel.heph-spotlight'), 'Primary dashboard panels must use the shared interaction treatment')
    const quickSettings = component('.jus-apollo-login-settings', 'AppSettingsPanel')
    check(quickSettings?.apolloHref?.includes(':20551/user'), 'Apollo account must be available from the account menu')
    check(document.querySelector('.day-night-toggle-container') && document.querySelector('.jus-apollo-login-setting-language-switch'), 'Quick settings must use the two Apollo switch controls')
    const quickStyle = getComputedStyle(document.querySelector('.jus-apollo-login-settings'))
    check(quickStyle.boxShadow === 'none' && quickStyle.backgroundImage === 'none', `Quick settings must not copy the Apollo panel frame (${quickStyle.boxShadow}; ${quickStyle.backgroundImage})`)
    quickSettings.switchLanguage('ja')
    await until(() => document.documentElement.lang === 'ja-JP', 'Japanese quick setting')
    check(quickSettings.queryLanguageText('zh') === '简体中文 - 中国語 (簡体)', 'Language labels must show self-name followed by the current-language name')
    check(!document.querySelector('.el-dropdown-link')?.textContent.trim(), 'Apollo language switch must remain icon-only')
    check(document.querySelector('.sidebar-account strong')?.textContent === 'fixtureAudit', 'Sidebar name order must follow Apollo in Japanese')
    quickSettings.switchLanguage('en')
    await until(() => document.querySelector('.sidebar-account strong')?.textContent === 'Audit fixture', 'English account name order')
    document.querySelector('.account-button').click()
    await until(() => document.querySelector('.currency-picker .el-select'), 'account currency select')
    check(document.querySelectorAll('.account-dropdown-menu .currency-picker').length === 1, 'Currency choices must be collapsed into one select')
    document.querySelector('.account-button').click()
    quickSettings.switchCurrency('EUR')
    await until(() => document.querySelector('.summary-grid .animated-value')?.getAttribute('aria-label')?.includes('€'), 'reactive display currency')
    quickSettings.switchCurrency('NZD')
    const topbar = document.querySelector('.workspace-topbar')
    const sidebar = document.querySelector('.workspace-sidebar')
    check(getComputedStyle(topbar).backdropFilter !== 'none' && getComputedStyle(sidebar).backdropFilter !== 'none', 'Top bar and sidebar must use glass blur')
    document.querySelector('.desktop-collapse').click()
    await until(() => sidebar.classList.contains('collapsed') && sidebar.getBoundingClientRect().width < 80, 'collapsed sidebar')
    check(JSON.parse(localStorage.getItem('hephaestus.settings.v1')).sidebarCollapsed === true, 'Sidebar preference must persist')
    document.querySelector('.desktop-collapse').click()
    await until(() => !sidebar.classList.contains('collapsed') && sidebar.getBoundingClientRect().width > 180, 'expanded sidebar')
    const motionCard = document.querySelector('.summary-grid .heph-stat')
    motionCard.classList.add('is-spotlight-active')
    check(getComputedStyle(motionCard).transform !== 'none', 'Reveal and spotlight transforms must compose on the same card')
    motionCard.classList.remove('is-spotlight-active')
    check(!requests.some(r => r.url === '/v1/work-records' && r.params?.limit === 8), 'Recent records must remain lazy while below the viewport')
    document.querySelector('.recent-panel').scrollIntoView({ block: 'start' })
    await until(() => requests.some(r => r.url === '/v1/work-records' && r.params?.limit === 8), 'lazy recent request')
    await until(() => document.querySelectorAll('.recent-panel .el-table__row').length >= 8, 'first recent page')
    check(Math.abs(document.querySelector('.workspace-topbar').getBoundingClientRect().top) < 1, 'Workspace top bar must remain fixed while the dashboard scrolls')
    check(!requests.some(r => r.url === '/v1/work-records' && r.params?.cursor === 'recent-cursor-8'), 'Recent records must not consume every cursor page before internal scrolling')
    const recentScroller = document.querySelector('.recent-panel .el-scrollbar__wrap')
    check(recentScroller && recentScroller.scrollHeight > recentScroller.clientHeight, 'Recent table must use a bounded internal scroll area')
    recentScroller.scrollTop = recentScroller.scrollHeight
    recentScroller.dispatchEvent(new Event('scroll', { bubbles: true }))
    await until(() => requests.some(r => r.url === '/v1/work-records' && r.params?.cursor === 'recent-cursor-8'), 'second recent request')
    await until(() => document.querySelectorAll('.recent-panel .el-table__row').length === 10, 'second recent page')
    check(new Set([...document.querySelectorAll('.recent-panel .customer-cell strong')].map(node => node.textContent)).size === 10, 'Infinite records must append without duplicates')
    window.scrollTo(0, 0)
    await router.push('/invoice?audit=1')
    await until(() => component('.invoice-maker', 'InvoiceMakerPage') || component('.invoice-maker-page', 'InvoiceMakerPage'))
    const invoice = component('.invoice-maker', 'InvoiceMakerPage') || component('.invoice-maker-page', 'InvoiceMakerPage')
    Object.assign(invoice.form, { invoiceNumber: '12345', issueDate: '2026-09-16', dueDate: '2026-09-30',
      serviceStart: '2026-09-01', serviceEnd: '2026-09-15', fromName: 'Audit fixture', billTo: 'Test company',
      amountInput: '123.45', description: 'Updated invoice description' })
    check(invoice.canDownload, 'Fixture invoice must be valid')
    const originalClick = HTMLAnchorElement.prototype.click
    try {
      HTMLAnchorElement.prototype.click = () => {}
      invoice.downloadPdf()
    } finally { HTMLAnchorElement.prototype.click = originalClick }
    check(invoice.store.activeDraft.amountCents === 12345 && invoice.store.activeDraft.description === 'Updated invoice description'
      && invoice.store.activeDraft.state === 'finalised', 'Finalised draft must match downloaded PDF inputs')
    await router.push('/records/new')
    await until(() => component('.record-edit-page', 'RecordEditPage'))
    let editor = component('.record-edit-page', 'RecordEditPage')
    await editor.save()
    await until(() => editor.original?.id === 'created')
    check(router.currentRoute.value.params.id === 'created', 'Create must become a loaded edit page')
    editor.data.customer = 'Edited after creation'
    await editor.save()
    check(requests.some(r => r.method === 'patch' && r.url.endsWith('/created')), 'Second save must update created record')
    await router.push('/records/second')
    await until(() => editor.original?.id === 'second')
    check(editor.data.customer === 'Record second', 'Route reuse must load second record')

    const { useInvoiceStore } = await import('/src/store/invoice.ts')
    const invoices = useInvoiceStore()
    const partial = invoices.createDraft({ invoiceNumber: '001', amountInput: '1.005' })
    check(partial.issueDate && partial.dueDate && partial.amountCents === 101, 'Partial draft must retain defaults and round exact decimal input')
    invoices.finalise(partial.id)
    for (const mutate of [() => invoices.updateDraft(partial.id, { state: 'draft' }), () => invoices.delete(partial.id)]) {
      let rejected = false
      try { mutate() } catch { rejected = true }
      check(rejected, 'Finalised invoices must reject editing and deletion')
    }
    check(invoices.duplicate(partial.id).invoiceNumber === '', 'Duplicate must need a new invoice number')
    const count = invoices.drafts.length
    const originalSet = Storage.prototype.setItem
    let failed = false
    try {
      Storage.prototype.setItem = function(key, value) { if (key.startsWith('hephaestus.invoice.')) throw new DOMException('Quota exceeded', 'QuotaExceededError'); return originalSet.call(this, key, value) }
      try { invoices.createDraft() } catch { failed = true }
    } finally { Storage.prototype.setItem = originalSet }
    check(failed && invoices.drafts.length === count, 'Storage failure must be reported and insertion rolled back')

    await router.push('/records?from=2026-09-01&to=2026-09-10&archived=archived&sort=gross-desc')
    await until(() => requests.some(r => r.url === '/v1/work-records' && r.params?.archived === 'archived'))
    await router.push('/records?from=2026-08-01&to=2026-08-31')
    await until(() => requests.some(r => r.url === '/v1/work-records' && r.params?.from === '2026-08-01'))
    const listRequest = requests.filter(r => r.url === '/v1/work-records').at(-1)
    check(listRequest.params.archived === 'active' && listRequest.params.sort === 'date-desc', 'Route query must replace stale filters')

    await router.push('/imports/first')
    await until(() => component('.import-detail-page', 'ImportDetailPage')?.batch?.id === 'first')
    const detail = component('.import-detail-page', 'ImportDetailPage')
    detail.setDecision(detail.rows.items[0], 'update')
    await detail.commit()
    check(!!detail.error && !requests.some(r => r.method === 'put'), 'Reopened batch needs mapping and an explicit error')
    detail.aimerPreset()
    detail.mapping.columns.push({ field: '', column: 9 })
    const committing = detail.commit()
    await confirm(committing)
    check(detail.batch.status === 'committed' && detail.batch.updated === 1, 'Reimport must commit after regeneration')
    const mappingRequest = requests.find(r => r.method === 'put')
    check(mappingRequest.body.decisions[0].record_id === 'existing', 'Update must retain target identity')

    await router.push('/imports/route-a')
    await until(() => detail.batch?.id === 'route-a' && !detail.loading)
    const pending = detail.commit()
    await until(() => document.querySelector('.el-message-box__btns button:last-child'))
    await router.push('/imports/route-b')
    await until(() => detail.batch?.id === 'route-b' && !detail.loading)
    await confirm(pending)
    check(!requests.some(r => r.method === 'post' && r.url.endsWith('route-b/commit')), 'Navigation must not submit old preview to new batch')
    return 'PASS: Apollo-identical quick switches and language labels, account-menu Apollo and currency actions, persistent collapsible glass navigation, fixed top bar, bounded internal record scrolling, accessible dashboard motion, lazy dashboard sections, cursor-based infinite records, current-month dashboard with independent all-time gross, invoice snapshot, lifecycle, storage failure rollback, exact amounts, create/edit route reuse, route filters, strict mapping validation, refreshed commit, navigation during confirmation'
  }), '--pageId', pageId)
  if (!result.includes('PASS:')) throw new Error(result)
  console.log(result)
} finally {
  cli('close_page', pageId)
}
