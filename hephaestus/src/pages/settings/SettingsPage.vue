<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Brush, Coin, Check } from '@element-plus/icons-vue'
import { useSettingsStore, type Currency, type Language } from '@/store/settings'

const { t } = useI18n()
const settings = useSettingsStore()
const languages: Language[] = ['zh', 'en', 'ja', 'ko']
const currencies: Currency[] = ['NZD', 'AUD', 'USD', 'EUR', 'CNY']
const themes = ['auto', 'light', 'dark'] as const
const themeLabels = { auto: 'settings.themeAuto', light: 'settings.themeLight', dark: 'settings.themeDark' }
const rate = computed({ get: () => settings.defaultRatePercent, set: (value) => { if (value != null && Number.isFinite(value)) settings.setDefaultRate(value) } })
const language = computed({ get: () => settings.language, set: value => settings.setLanguage(value) })
const theme = computed({ get: () => settings.theme, set: value => settings.setTheme(value) })
const currency = computed({ get: () => settings.currency, set: value => settings.setCurrency(value) })
const dateFormat = computed({ get: () => settings.defaultDateFormat, set: value => settings.setDefaultDateFormat(value) })
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <div><p class="eyebrow">Hephaestus</p><h1>{{ t('settings.heading') }}</h1><p class="subtitle">{{ t('settings.subtitle') }}</p></div>
      <span class="save-note"><el-icon><Check /></el-icon>{{ t('settings.autoSave') }}</span>
    </header>

    <section class="settings-section" aria-labelledby="appearance-heading">
      <header class="section-heading"><span class="section-icon"><Brush /></span><div><h2 id="appearance-heading">{{ t('settings.appearance') }}</h2><p>{{ t('settings.appearanceNote') }}</p></div></header>
      <div class="settings-fields">
        <div class="setting-row"><div class="setting-copy"><label for="settings-language">{{ t('settings.language') }}</label></div><el-select id="settings-language" v-model="language"><el-option v-for="value in languages" :key="value" :value="value" :label="t(`languages.${value}.original`) + ' · ' + t(`languages.${value}.text`)" /></el-select></div>
        <div class="setting-row theme-row"><div class="setting-copy"><span id="theme-label">{{ t('settings.theme') }}</span><p>{{ t('settings.themeHelp') }}</p></div><el-radio-group v-model="theme" aria-labelledby="theme-label"><el-radio-button v-for="value in themes" :key="value" :value="value">{{ t(themeLabels[value]) }}</el-radio-button></el-radio-group></div>
      </div>
    </section>

    <section class="settings-section" aria-labelledby="calculation-heading">
      <header class="section-heading"><span class="section-icon"><Coin /></span><div><h2 id="calculation-heading">{{ t('settings.calculation') }}</h2><p>{{ t('settings.calculationNote') }}</p></div></header>
      <div class="settings-fields">
        <div class="setting-row"><div class="setting-copy"><label for="settings-currency">{{ t('settings.currency') }}</label><p>{{ t('settings.currencyNote') }}</p></div><el-select id="settings-currency" v-model="currency"><el-option v-for="value in currencies" :key="value" :value="value" :label="t(`currencies.${value}`)" /></el-select></div>
        <div class="setting-row"><div class="setting-copy"><label for="settings-rate">{{ t('settings.defaultRate') }}</label><p>{{ t('settings.rateHelp') }}</p></div><el-input-number id="settings-rate" v-model="rate" :min="0" :max="100" :step="0.5" :precision="1" controls-position="right" /></div>
        <div class="setting-row"><div class="setting-copy"><label for="settings-date">{{ t('settings.dateFormat') }}</label><p>{{ t('settings.dateHelp') }}</p></div><el-select id="settings-date" v-model="dateFormat"><el-option value="iso" label="YYYY-MM-DD" /><el-option value="dmy" label="DD/MM/YYYY" /><el-option value="mdy" label="MM/DD/YYYY" /><el-option value="excel" :label="t('imports.mapping.dateExcel')" /></el-select></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-page { max-width:1120px; width:100%; margin-inline:auto; display:grid; gap:24px; }
.page-header { align-items:flex-start; gap:16px; }
.save-note { display:flex; align-items:center; gap:6px; margin-top:8px; color:var(--heph-muted); font-size:12px; line-height:1.5; }
.save-note .el-icon { color:var(--heph-pine); }
.settings-section { display:grid; grid-template-columns:minmax(200px, .8fr) minmax(0, 2fr); gap:28px; padding-top:24px; border-top:1px solid var(--heph-line); }
.section-heading { display:flex; align-items:flex-start; gap:12px; }
.section-icon { display:grid; place-items:center; flex:none; width:36px; height:36px; border:1px solid var(--heph-line); border-radius:10px; color:var(--heph-pine); background:var(--heph-paper-solid); }
.section-icon svg { width:18px; }
.section-heading h2 { margin:2px 0 8px; font-size:15px; font-weight:600; }
.section-heading p { margin:0; font-size:12px; line-height:1.7; color:var(--heph-muted); }
.settings-fields { min-width:0; padding:0 22px; border:1px solid var(--heph-line); border-radius:12px; background:var(--heph-paper-solid); }
.setting-row { display:grid; grid-template-columns:minmax(0,1fr) 220px; gap:24px; align-items:center; padding:24px 0; }
.setting-row + .setting-row { border-top:1px solid var(--heph-line); }
.setting-copy { min-width:0; font-size:13px; font-weight:550; }
.setting-copy p { margin:8px 0 0; font-size:12px; font-weight:400; line-height:1.75; color:var(--heph-muted); }
.setting-row :deep(.el-select), .setting-row :deep(.el-input-number) { width:100%; }
.theme-row { grid-template-columns:1fr; gap:14px; }
.theme-row :deep(.el-radio-group) { display:flex; }
.theme-row :deep(.el-radio-button) { flex:1; }
.theme-row :deep(.el-radio-button__inner) { width:100%; padding:10px 12px; font-size:12px; white-space:normal; line-height:1.5; }
@media(max-width:1100px) { .settings-section { grid-template-columns:1fr; gap:16px; } }
@media(max-width:600px) { .settings-page { gap:20px; }.settings-fields { padding:0 16px; }.setting-row { grid-template-columns:1fr; gap:14px; padding:20px 0; }.settings-section { padding-top:20px; }.page-header { flex-direction:column; }.save-note { margin-top:0; } }
</style>
