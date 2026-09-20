<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElConfigProvider } from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ja from 'element-plus/es/locale/lang/ja'
import ko from 'element-plus/es/locale/lang/ko'

import { useInvoiceStore } from '@/store/invoice'
import { useSessionStore } from '@/store/session'
import { useSettingsStore } from '@/store/settings'

import AppSidebar from '@/components/common/AppSidebar.vue'
import TopBar from '@/components/common/TopBar.vue'
import InvoiceShell from '@/components/invoice/InvoiceShell.vue'
import { configureMoneyFormat } from '@/utils/format'

const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false })
const session = useSessionStore()
const invoice = useInvoiceStore()
watch(() => session.ownerId, (owner) => invoice.switchOwner(owner), { immediate: true, flush: 'sync' })
const settings = useSettingsStore()
const { t, locale } = useI18n()

const layout = computed<'minimal' | 'default' | 'invoice'>(() => {
  const value = route.meta.layout as string | undefined
  return value === 'invoice' || value === 'minimal' ? value : 'default'
})

let mediaQuery: MediaQueryList | null = null
const onSystem = () => { if (settings.theme === 'auto') applyTheme('auto') }

function applyTheme(mode: 'light' | 'dark' | 'auto') {
  const root = document.documentElement
  let resolved: 'light' | 'dark'
  if (mode === 'auto') {
    resolved = mediaQuery?.matches ? 'dark' : 'light'
  } else {
    resolved = mode
  }
  root.setAttribute('data-theme', resolved)
}

const elementLocale = computed(() => ({ en, zh: zhCn, ja, ko })[settings.language] ?? en)

function applyLanguage(lang: typeof settings.language) {
  document.documentElement.lang = ({ en: 'en', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR' })[lang]
  locale.value = lang
  configureMoneyFormat(settings.currency, lang)
}

watch(
  () => settings.theme,
  (m) => applyTheme(m ?? 'auto'),
  { immediate: true },
)

watch(
  () => settings.language,
  (l) => applyLanguage(l ?? 'en'),
  { immediate: true },
)

watch(
  () => settings.currency,
  currency => configureMoneyFormat(currency, settings.language),
  { immediate: true },
)

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  applyTheme(settings.theme)
  mediaQuery.addEventListener('change', onSystem)
})
onBeforeUnmount(() => mediaQuery?.removeEventListener('change', onSystem))
</script>

<template>
  <el-config-provider :locale="elementLocale">
  <div :class="['heph-shell', { 'has-workspace': layout !== 'minimal', 'sidebar-collapsed': settings.sidebarCollapsed }]">
    <template v-if="layout !== 'minimal'">
      <a class="skip-link" href="#main-content">{{ t('ui.skipToContent') }}</a>
      <AppSidebar :open="menuOpen" :collapsed="settings.sidebarCollapsed" @close="menuOpen = false" />
      <button v-if="menuOpen" class="sidebar-backdrop" type="button" :aria-label="t('ui.closeNavigation')" @click="menuOpen = false"></button>
      <div class="workspace-content">
        <el-affix :offset="0" :z-index="30"><TopBar :menu-open="menuOpen" :sidebar-collapsed="settings.sidebarCollapsed" @menu="menuOpen = !menuOpen" @collapse="settings.setSidebarCollapsed(!settings.sidebarCollapsed)" /></el-affix>
        <main v-if="layout === 'default'" id="main-content" class="heph-page" tabindex="-1">
          <router-view v-if="!route.meta.requiresAuth || session.isAuthenticated" :key="session.ownerId" />
        </main>
        <main v-else id="main-content" tabindex="-1">
          <InvoiceShell><router-view v-if="!route.meta.requiresAuth || session.isAuthenticated" :key="session.ownerId" /></InvoiceShell>
        </main>
      </div>
    </template>
    <router-view v-else :key="session.ownerId" />
  </div>
  </el-config-provider>
</template>

<style>
.heph-shell { min-height: 100vh; }
.workspace-content { min-width:0; margin-left:var(--heph-sidebar-width); transition:margin-left .28s var(--heph-ease); }
.sidebar-collapsed .workspace-content { margin-left:var(--heph-sidebar-collapsed-width); }
.skip-link { position: fixed; top: -60px; left: 250px; z-index: 100; padding: 12px 18px; background: var(--heph-paper-solid); border-radius: 7px; }.skip-link:focus { top: 12px; }
.sidebar-backdrop { display: none; }
@media(max-width:900px) { .workspace-content,.sidebar-collapsed .workspace-content { margin-left:0; }.sidebar-backdrop { display:block; position:fixed; inset:0; z-index:35; border:0; background:#0a191b88; backdrop-filter:blur(4px); }.skip-link { left:16px; } }
</style>
