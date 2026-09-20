<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ArrowRight, Expand, Fold } from '@element-plus/icons-vue'
import AppSettingsPanel from '@/components/common/AppSettingsPanel.vue'

defineProps<{ menuOpen: boolean; sidebarCollapsed: boolean }>()
const emit = defineEmits<{ menu: []; collapse: [] }>()
const { t, locale } = useI18n()
const route = useRoute()
const currentTitle = computed(() => {
  const segment = route.path.split('/')[1]
  return segment === 'invoice' ? t('app.invoice') : t(`nav.${['dashboard', 'records', 'imports', 'sources', 'settings'].includes(segment) ? segment : 'dashboard'}`)
})
const workspaceLabel = computed(() => t('ui.workspace'))
</script>

<template>
  <header class="workspace-topbar">
    <div class="breadcrumb">
      <button class="menu-toggle mobile-menu" type="button" :aria-label="t('ui.openNavigation')" :aria-expanded="menuOpen" aria-controls="workspace-navigation" @click="emit('menu')"><Fold /></button>
      <button class="menu-toggle desktop-collapse" type="button" :aria-label="sidebarCollapsed ? (t('ui.expandSidebar')) : (t('ui.collapseSidebar'))" :aria-pressed="sidebarCollapsed" @click="emit('collapse')"><Expand v-if="sidebarCollapsed" /><Fold v-else /></button>
      <span class="breadcrumb-root">{{ workspaceLabel }}</span><ArrowRight class="breadcrumb-arrow" /><strong>{{ currentTitle }}</strong>
    </div>
    <div class="topbar-right"><AppSettingsPanel /></div>
  </header>
</template>

<style scoped>
.workspace-topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; height:clamp(60px,7vh,68px); padding:0 0 0 clamp(16px,2vw,28px); background:color-mix(in srgb,var(--heph-paper-solid) 76%,transparent); border-bottom:1px solid color-mix(in srgb,var(--heph-line-strong) 42%,transparent); box-shadow:0 10px 30px rgba(12,35,36,.035); backdrop-filter:blur(22px) saturate(145%); -webkit-backdrop-filter:blur(22px) saturate(145%); }
.breadcrumb { display:flex; align-items:center; gap:11px; font-size:11px; }.breadcrumb-root { color:var(--heph-muted); }.breadcrumb strong { font-weight:500; }.breadcrumb-arrow { width:10px; color:var(--heph-muted); }.topbar-right { display:flex; align-items:center; align-self:stretch; }
.menu-toggle { display:grid; place-items:center; width:30px; height:30px; padding:6px; color:var(--heph-muted); background:transparent; border:0; border-radius:7px; cursor:pointer; transition:color .2s ease,background .2s ease; }.menu-toggle:hover { color:var(--heph-ink); background:color-mix(in srgb,var(--heph-paper-solid) 42%,transparent); }.mobile-menu { display:none; }
@media(max-width:1100px) { .workspace-topbar { padding-left:18px; } }
@media(max-width:900px) { .desktop-collapse { display:none; }.mobile-menu { display:grid; } }
@media(min-width:901px) and (max-height:800px) { .workspace-topbar { height:52px; } }
@media(max-width:600px) { .workspace-topbar { height:64px; padding-left:10px; }.breadcrumb { gap:7px; }.breadcrumb-root,.breadcrumb-arrow { display:none; } }
</style>
