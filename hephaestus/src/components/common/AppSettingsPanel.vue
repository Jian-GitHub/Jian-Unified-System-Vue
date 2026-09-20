<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowDown, Coin, Link, Setting, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { apolloAccountUrl } from '@/api/apollo'
import ApolloThemeToggle from '@/components/common/ApolloThemeToggle.vue'
import ArrowDropDownIcon from '@/components/common/ArrowDropDownIcon.vue'
import TranslateIcon from '@/components/common/TranslateIcon.vue'
import { useSessionStore } from '@/store/session'
import { useSettingsStore, type Currency, type Language } from '@/store/settings'

const { t, locale } = useI18n()
const router = useRouter()
const session = useSessionStore()
const settings = useSettingsStore()

const languages: Language[] = ['zh', 'ja', 'en', 'ko']
const currencies: Currency[] = ['NZD', 'AUD', 'USD', 'EUR', 'CNY']
const apolloHref = apolloAccountUrl()
const nowLanguage = computed(() => locale.value)
const initials = computed(() => (session.localizedDisplayName(settings.language) || 'A').trim().slice(0, 1).toUpperCase())

const switchLanguage = (language: Language): void => {
  locale.value = language
  settings.setLanguage(language)
}

const queryLanguageText = (language: Language): string => {
  return t(`languages.${language}.original`) + ' - ' + t(`languages.${language}.text`)
}

const switchCurrency = (currency: Currency): void => {
  settings.setCurrency(currency)
}

async function handleAccount(command: string) {
  if (command === 'apollo') {
    window.location.assign(apolloHref)
    return
  }
  if (command === 'settings') {
    await router.push({ name: 'settings' })
    return
  }
  if (command !== 'logout') return
  try {
    await session.signOut()
    ElMessage.success(t('app.logout'))
    await router.replace('/invoice')
  } catch {
    ElMessage.error(t('settings.logoutFailed'))
  }
}
</script>

<template>
  <div class="jus-apollo-login-settings">
    <ApolloThemeToggle />
    <div class="jus-apollo-login-setting-language-switch">
      <el-dropdown trigger="click" @command="switchLanguage">
        <button type="button" class="el-dropdown-link" :aria-label="t('settings.language')">
          <TranslateIcon class="jus-apollo-login-setting-language-switch-icon" />
          <ArrowDropDownIcon class="jus-apollo-login-setting-language-switch-icon arrow-down" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(value, index) in languages"
              :key="index"
              :disabled="nowLanguage === value"
              :command="value"
            >
              {{ queryLanguageText(value) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-dropdown trigger="click" :hide-on-click="false" @command="handleAccount">
      <button class="account-button" type="button" :aria-label="session.localizedDisplayName(settings.language) || t('settings.openApollo')">
        <span class="avatar">{{ initials }}</span><el-icon class="account-arrow"><ArrowDown /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu class="account-dropdown-menu">
          <el-dropdown-item command="apollo"><el-icon><Link /></el-icon>{{ t('settings.openApollo') }}</el-dropdown-item>
          <el-dropdown-item command="settings"><el-icon><Setting /></el-icon>{{ t('nav.settings') }}</el-dropdown-item>
          <li class="currency-picker" @click.stop @keydown.stop>
            <label for="account-currency"><el-icon><Coin /></el-icon>{{ t('settings.currency') }}</label>
            <el-select id="account-currency" :model-value="settings.currency" size="small" @change="switchCurrency">
              <el-option v-for="currency in currencies" :key="currency" :label="t(`currencies.${currency}`)" :value="currency" />
            </el-select>
          </li>
          <el-dropdown-item v-if="session.isAuthenticated" divided command="logout"><el-icon><SwitchButton /></el-icon>{{ t('app.logout') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.jus-apollo-login-settings {
  top: 0;
  right: 0;
  position: sticky;
  z-index: 1;
  color: var(--heph-ink);
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 4px 0 8px;
}

.jus-apollo-login-setting-language-switch {
  /* Match Apollo light/dark secondary-text shadow colors. */
  --language-hover-shadow: #757575;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  will-change: filter;
}

.jus-apollo-login-setting-language-switch:hover {
  transition: all 0.3s ease-out;
  filter: drop-shadow(0px 2px 6px var(--language-hover-shadow));
}

:deep(.el-dropdown) { border: none; }
.el-dropdown-link { display:flex; align-items:center; justify-content:center; width:36px; height:36px; padding:0; border:0; border-radius:6px; background:transparent; cursor:pointer; }
:global([data-theme="dark"] .jus-apollo-login-setting-language-switch) { --language-hover-shadow: #9E9E9E; }
.el-dropdown-link:focus-visible { outline:2px solid var(--heph-pine); outline-offset:2px; }
.jus-apollo-login-setting-language-switch-icon { width: 18px; height: 18px; color: var(--heph-ink); }
.jus-apollo-login-setting-language-switch-icon.arrow-down { width:14px; height:14px; }

.account-button { display:flex; align-items:center; justify-content:center; gap:4px; min-height:34px; padding:0 0 0 13px; color:var(--heph-ink); border:0; border-left:1px solid color-mix(in srgb,var(--heph-line-strong) 58%,transparent); background:transparent; cursor:pointer; }
.avatar { display:grid; place-items:center; width:30px; height:30px; color:var(--heph-pine); border-radius:50%; background:var(--heph-mint); font-size:11px; font-weight:650; }
.account-arrow { font-size:9px; color:var(--heph-muted); }

:global(.account-dropdown-menu) { min-width:260px; }
:global(.account-dropdown-menu .currency-picker) { display:grid; gap:8px; margin-top:5px; padding:12px 16px 10px; border-top:1px solid var(--heph-line); list-style:none; }
:global(.account-dropdown-menu .currency-picker label) { display:flex; align-items:center; gap:7px; color:var(--heph-muted); font-size:12px; }
:global(.account-dropdown-menu .currency-picker .el-select) { width:100%; }

@media(max-width:600px) { .jus-apollo-login-settings { gap:.65rem; padding-inline:.5rem; }.account-button { padding-left:8px; } }
</style>
