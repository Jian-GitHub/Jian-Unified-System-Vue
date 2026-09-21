<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ArrowRight, Expand, Fold } from '@element-plus/icons-vue'
import AppSettingsPanel from '@/components/common/AppSettingsPanel.vue'

defineProps<{ menuOpen: boolean; sidebarCollapsed: boolean }>()
const emit = defineEmits<{ menu: []; collapse: [] }>()
const { t } = useI18n()
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
      <el-button text class="menu-toggle mobile-menu" :aria-label="t('ui.openNavigation')" :aria-expanded="menuOpen" aria-controls="workspace-navigation" @click="emit('menu')"><Fold /></el-button>
      <el-button text class="menu-toggle desktop-collapse" :aria-label="sidebarCollapsed ? (t('ui.expandSidebar')) : (t('ui.collapseSidebar'))" :aria-pressed="sidebarCollapsed" @click="emit('collapse')"><Expand v-if="sidebarCollapsed" /><Fold v-else /></el-button>
      <span class="breadcrumb-root">{{ workspaceLabel }}</span><ArrowRight class="breadcrumb-arrow" /><strong>{{ currentTitle }}</strong>
    </div>
    <div class="topbar-right"><AppSettingsPanel /></div>
  </header>
</template>

<style scoped>
.workspace-topbar { position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:12px; height:clamp(60px,7vh,68px); padding:0 0 0 clamp(16px,2vw,28px); background:color-mix(in srgb,var(--heph-paper-solid) 18%,transparent); border-bottom:1px solid color-mix(in srgb,var(--heph-line) 45%,transparent); backdrop-filter:blur(3px) saturate(125%); -webkit-backdrop-filter:blur(3px) saturate(125%); }
.breadcrumb { min-width:0; display:flex; align-items:center; gap:11px; font-size:11px; }.breadcrumb-root { color:var(--heph-muted); }.breadcrumb strong { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:500; }.breadcrumb-arrow { width:10px; color:var(--heph-muted); }.topbar-right { display:flex; align-items:center; flex-shrink:0; }
.menu-toggle { display:grid; place-items:center; flex-shrink:0; width:44px; height:44px; padding:6px; color:var(--heph-muted); background:transparent; border:0; border-radius:7px; cursor:pointer; transition:color .2s ease,background .2s ease; }.menu-toggle:hover { color:var(--heph-ink); background:color-mix(in srgb,var(--heph-paper-solid) 42%,transparent); }.menu-toggle :deep(svg) { width:18px; height:18px; }.mobile-menu { display:none; }
@media(max-width:1100px) { .workspace-topbar { padding-left:18px; } }
@media(max-width:900px) { .desktop-collapse { display:none; }.mobile-menu { display:grid; } }
@media(min-width:901px) and (max-height:800px) { .workspace-topbar { height:52px; } }
@media(max-width:600px) { .workspace-topbar { height:64px; padding-left:10px; }.breadcrumb { gap:7px; }.breadcrumb-root,.breadcrumb-arrow { display:none; } }
</style>
