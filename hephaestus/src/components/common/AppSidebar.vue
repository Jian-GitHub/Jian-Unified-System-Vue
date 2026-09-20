<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { DataAnalysis, Document, Upload, Coin, Setting, TopRight, Plus, Close, Grid, Lock } from '@element-plus/icons-vue'
import { useSessionStore } from '@/store/session'
import type { Language } from '@/store/settings'
import { apolloAccountUrl } from '@/api/apollo'

const props = defineProps<{ open: boolean; collapsed: boolean }>()
const sidebar = ref<HTMLElement | null>(null)
watch(() => props.open, async open => {
  await nextTick()
  if (open) sidebar.value?.querySelector<HTMLButtonElement>('.sidebar-close')?.focus()
  else document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus()
})
function trapFocus(event: KeyboardEvent) {
  if (!props.open || event.key !== 'Tab') return
  const items = Array.from(sidebar.value?.querySelectorAll<HTMLElement>('a[href], button') ?? [])
  const first = items[0], last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
const emit = defineEmits<{ close: [] }>()
const { t, locale } = useI18n()
const route = useRoute()
const session = useSessionStore()
const accountName = computed(() => session.localizedDisplayName(locale.value as Language) || (t('ui.guestWorkspace')))
const accountInitial = computed(() => accountName.value.trim().slice(0, 1).toUpperCase() || 'H')
const navigation = computed(() => [
  { name: 'dashboard', path: '/dashboard', label: t('nav.dashboard'), icon: DataAnalysis },
  { name: 'records', path: '/records', label: t('nav.records'), icon: Document },
  { name: 'imports', path: '/imports', label: t('nav.imports'), icon: Upload },
  { name: 'sources', path: '/sources', label: t('nav.sources'), icon: Coin },
])
</script>

<template>
  <aside ref="sidebar" id="workspace-navigation" :role="open ? 'dialog' : undefined" :aria-modal="open ? true : undefined" @keydown="trapFocus" :class="['workspace-sidebar', { open, collapsed }]" :aria-label="t('ui.mainNavigation')" @keydown.esc="emit('close')">
    <router-link to="/dashboard" class="workspace-brand" @click="emit('close')">
      <span class="brand-symbol" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M7 6v20m18-20v20M7 16h18M12 10l8 12" stroke="currentColor" stroke-width="3" stroke-linecap="square" /></svg></span>
      <span>hephaestus<span class="brand-caption">{{ t('ui.financeWorkspace') }}</span></span>
    </router-link>
    <button class="sidebar-close" type="button" :aria-label="t('ui.closeNavigation')" @click="emit('close')"><Close /></button>
    <div class="workspace-switch"><span class="workspace-icon"><Grid /></span><div><strong>{{ t('ui.personalWorkspace') }}</strong><small>{{ t('ui.incomeFinances') }}</small></div><span class="workspace-plan">NZ</span></div>
    <p class="nav-caption">{{ t('ui.workspace') }}</p>
    <nav class="workspace-nav">
      <router-link v-for="item in navigation" :key="item.name" :to="{ name: item.name }" :title="collapsed ? item.label : undefined" :aria-label="item.label" :class="{ selected: route.path.startsWith(item.path) }" @click="emit('close')"><component :is="item.icon" /><span>{{ item.label }}</span><span v-if="route.path.startsWith(item.path)" class="active-dot"></span></router-link>
    </nav>
    <p class="nav-caption tools-caption">{{ t('ui.financeTools') }}</p>
    <nav class="workspace-nav">
      <router-link to="/invoice" :title="collapsed ? t('app.invoice') : undefined" :aria-label="t('app.invoice')" :class="{ selected: route.path.startsWith('/invoice') }" @click="emit('close')"><Document /><span>{{ t('app.invoice') }}</span><TopRight class="external-arrow" /></router-link>
      <router-link to="/settings" :title="collapsed ? t('nav.settings') : undefined" :aria-label="t('nav.settings')" :class="{ selected: route.name === 'settings' }" @click="emit('close')"><Setting /><span>{{ t('nav.settings') }}</span></router-link>
    </nav>
    <div class="sidebar-bottom">
      <div class="sidebar-callout"><span class="callout-icon"><Upload /></span><strong>{{ t('ui.everyJobAccountedFor') }}</strong><p>{{ t('ui.turnYourWorkRecordsIntoAClearerFinancialPicture') }}</p><router-link to="/imports/new" @click="emit('close')"><Plus />{{ t('ui.importYourRecords') }}<TopRight /></router-link></div>
      <a class="sidebar-account" :href="apolloAccountUrl()" :title="accountName" :aria-label="`${accountName} · Apollo`"><span class="sidebar-avatar">{{ accountInitial }}</span><div><strong>{{ accountName }}</strong><small><Lock />{{ session.isAuthenticated ? (t('ui.apolloConnected')) : (t('ui.openApolloAccount')) }}</small></div><TopRight class="account-open" /></a>
    </div>
  </aside>
</template>

<style scoped>
.workspace-sidebar { position:fixed; inset:0 auto 0 0; z-index:40; display:flex; flex-direction:column; width:var(--heph-sidebar-width); padding:clamp(22px,3vh,30px) 14px 0; color:#eef7f4; background:color-mix(in srgb,var(--heph-sidebar) 84%,transparent); border-right:1px solid #ffffff12; box-shadow:10px 0 34px rgba(3,20,20,.08); backdrop-filter:blur(22px) saturate(130%); -webkit-backdrop-filter:blur(22px) saturate(130%); overflow-y:auto; transition:width .28s var(--heph-ease),padding .28s var(--heph-ease),transform .25s ease; }
.workspace-brand { display: flex; align-items: center; gap: 10px; padding: 0 6px; color: #f4faf7; font-size: 20px; font-weight: 600; letter-spacing: -.6px; text-decoration: none; }
.brand-symbol { display: grid; place-items: center; width: 34px; height: 38px; color: #bce7cd; }.brand-symbol svg { width: 32px; }.brand-caption { display: block; margin-top: 5px; color: #8ea5a4; font-size: 8px; font-weight: 500; letter-spacing: 1.1px; white-space: nowrap; }
.workspace-switch { display: flex; align-items: center; gap: 8px; margin: clamp(22px, 3vh, 30px) 0 22px; padding: 10px 8px; border: 1px solid #ffffff12; border-radius: 8px; background: #ffffff03; }.workspace-icon { display: grid; place-items: center; width: 26px; height: 28px; border-radius: 6px; color: #bce7cd; background: #ffffff0a; }.workspace-icon svg { width: 15px; }.workspace-switch strong { display: block; font-size: 11px; font-weight: 500; }.workspace-switch small { display: block; margin-top: 3px; color: #8ea5a4; font-size: 10px; }.workspace-plan { margin-left: auto; font-size: 10px; color: #9cb2ae; border: 1px solid #ffffff15; padding: 3px; border-radius: 3px; }
.nav-caption { margin: 0 10px 9px; color: #78928f; font-size: 10px; letter-spacing: 1.5px; font-weight: 500; }.tools-caption { margin-top: clamp(20px, 3vh, 28px); }.workspace-nav { display: grid; gap: 3px; }.workspace-nav a { display: flex; align-items: center; gap: 10px; min-height: 38px; padding: 8px 11px; border-radius: 7px; color: #a5b7b5; font-size: 11px; transition: background .2s,color .2s; }.workspace-nav a:hover { background: #ffffff08; color: #fff; text-decoration: none; }.workspace-nav svg { width: 16px; height: 16px; flex: none; opacity: .9; }.workspace-nav a.selected { background: #bce7cd; color: #193d32; font-weight: 600; }.active-dot { width: 5px; height: 5px; margin-left: auto; border-radius: 50%; background: #24755b; }.workspace-nav .external-arrow { width: 12px; margin-left: auto; }
.sidebar-bottom { margin-top: auto; padding-top: clamp(18px, 4vh, 40px); }.sidebar-callout { padding: 13px 12px; border: 1px solid #ffffff0e; border-radius: 9px; background: linear-gradient(135deg,#ffffff07,#ffffff02); }.callout-icon { display: grid; place-items: center; width: 27px; height: 27px; margin-bottom: 10px; background: #ffffff09; border-radius: 7px; color: #bce7cd; }.callout-icon svg { width: 14px; }.sidebar-callout strong { font-size: 10px; font-weight: 500; }.sidebar-callout p { color: #8ea5a4; font-size: 10px; line-height: 1.65; margin: 6px 0 11px; }.sidebar-callout a { display: flex; align-items: center; gap: 7px; color: #c7e8d5; font-size: 10px; }.sidebar-callout a svg { width: 12px; }.sidebar-callout a svg:last-child { margin-left: auto; }.sidebar-account { display:flex; align-items:center; gap:9px; margin-top:16px; padding:14px 4px; color:inherit; border-top:1px solid #ffffff10; text-decoration:none; transition:background .2s ease,color .2s ease; }.sidebar-account:hover { color:#fff; text-decoration:none; }.sidebar-avatar { display: grid; place-items: center; width: 29px; height: 29px; border-radius: 50%; background: #39524c; color: #d3e9da; font-size: 11px; }.sidebar-account strong { display: block; max-width: 125px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; font-weight: 500; }.sidebar-account small { display: flex; align-items: center; gap: 4px; margin-top: 3px; color: #8ea5a4; font-size: 10px; }.sidebar-account small svg { width: 9px; }.account-open { width:11px; margin-left:auto; color:#8ea5a4; }.sidebar-close { display: none; }
@media(max-height:760px) and (min-width:901px) { .sidebar-callout { display:none; }.sidebar-bottom { padding-top:12px; }.workspace-switch { margin-top:18px; margin-bottom:16px; }.tools-caption { margin-top:16px; } }
@media(min-width:901px) {
  .workspace-sidebar.collapsed { width:var(--heph-sidebar-collapsed-width); padding-inline:10px; }
  .workspace-sidebar.collapsed .workspace-brand { justify-content:center; padding:0; }
  .workspace-sidebar.collapsed .workspace-brand > span:last-child,
  .workspace-sidebar.collapsed .workspace-switch > div,
  .workspace-sidebar.collapsed .workspace-plan,
  .workspace-sidebar.collapsed .nav-caption,
  .workspace-sidebar.collapsed .workspace-nav a > span,
  .workspace-sidebar.collapsed .workspace-nav .external-arrow,
  .workspace-sidebar.collapsed .sidebar-callout,
  .workspace-sidebar.collapsed .sidebar-account > div { display:none; }
  .workspace-sidebar.collapsed .sidebar-account .account-open { display:none; }
  .workspace-sidebar.collapsed .workspace-switch { justify-content:center; margin-top:24px; padding:8px 0; border-color:transparent; background:transparent; }
  .workspace-sidebar.collapsed .workspace-nav { gap:7px; }
  .workspace-sidebar.collapsed .workspace-nav + .workspace-nav { margin-top:18px; padding-top:18px; border-top:1px solid #ffffff12; }
  .workspace-sidebar.collapsed .workspace-nav a { justify-content:center; min-height:42px; padding:8px; }
  .workspace-sidebar.collapsed .workspace-nav svg { width:18px; height:18px; }
  .workspace-sidebar.collapsed .sidebar-bottom { padding-top:18px; }
  .workspace-sidebar.collapsed .sidebar-account { justify-content:center; padding-inline:0; }
}
@media(max-width:900px) { .workspace-sidebar { width:min(var(--heph-sidebar-width),84vw); transform:translateX(-100%); visibility:hidden; }.workspace-sidebar.open { transform:translateX(0); visibility:visible; }.sidebar-close { position:absolute; top:10px; right:10px; display:grid; place-items:center; width:24px; height:24px; padding:4px; border:0; background:transparent; color:#a5b7b5; cursor:pointer; } }
</style>
