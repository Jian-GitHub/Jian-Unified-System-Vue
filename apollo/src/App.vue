<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue';
import {useSessionStore} from "@/store";
import type {Theme} from "@/store"

const globalStore = useSessionStore()

import {useI18n} from "vue-i18n";

const {locale} = useI18n()


// listener
let mediaQuery: MediaQueryList | null = null;

const setTheme = (mode: Theme) => {
  document.documentElement.setAttribute('data-theme', mode);
  globalStore.theme = mode;
};

// default language: en
const systemLanguage = ref('en');
const updateSystemLanguage = (customizedLanguage: string | null) => {
  if (customizedLanguage === null) {
    const lang = navigator.language || (navigator as any).userLanguage || 'en';
    systemLanguage.value = lang.split('-')[0].toLowerCase();
  } else {
    systemLanguage.value = customizedLanguage;
  }
  locale.value = systemLanguage.value;
};

onMounted(() => {
  console.info(
      "%c Apollo - Jian Unified System %c v" + "0.1.0",
      "padding: 2px 6px; border-radius: 3px 0 0 3px; color: #fff; background: #FF6699; font-weight: bold;",
      "padding: 2px 6px; border-radius: 0 3px 3px 0; color: #fff; background: #FF9999; font-weight: bold;"
  );
  // Check System Language
  if (!globalStore.language) {
    // init system language
    updateSystemLanguage(null);
  } else {
    updateSystemLanguage(globalStore.language);
  }
  // watch system language changes
  window.addEventListener('languagechange', () => updateSystemLanguage(null));

  // check system mode
  if (window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let initTheme: Theme = mediaQuery.matches ? 'dark' : 'light';
    if (globalStore.preferredTheme) {
      initTheme = globalStore.preferredTheme as Theme;
    }
    setTheme(initTheme);

    mediaQuery.addEventListener('change', themeListener);
  }
});

const themeListener = (e: MediaQueryListEvent) => {
  if (globalStore.preferredTheme) return;
  setTheme(e.matches ? 'dark' : 'light');
}

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', themeListener);
  window.removeEventListener('languagechange', () => updateSystemLanguage(null));
});

import Settings from "@/components/login/setting/Settings.vue";
</script>

<template>
  <div class="jus-apollo-page">
    <router-view/>
    <Settings class="jus-apollo-page-settings"/>
  </div>
</template>

<style scoped>
@import "assets/main.css";

.jus-apollo-page {
  min-width: 980px;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  position: relative;
}
.jus-apollo-page-content {
  /*
  min-width: 980px;
   */
  width: 100vw;
  height: 100vh;
  min-width: 980px;
  min-height: 330px;
  overflow: auto;
  position: relative;
}

.jus-apollo-page-settings {
  position: fixed;
  right: 0;
  left: auto;
  top: 0;
  bottom: auto;
}
</style>
