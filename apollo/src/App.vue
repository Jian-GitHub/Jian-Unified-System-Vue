<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue';
// import LoginPage from '@/components/login/LoginPage.vue'
// import SecurityPage from "@/components/user/security/UserPage.vue";
import {useGlobalStore} from "@/store";
import type {Theme} from "@/store"

const globalStore = useGlobalStore()

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
  // Check System Language
  // const savedLanguage: string | null = localStorage.getItem('language');
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
    // const savedTheme: string | null = localStorage.getItem('theme');

    // if (savedTheme === 'light' || savedTheme === 'dark') {
    if (globalStore.preferredTheme) {
      // initTheme = savedTheme as Theme;
      initTheme = globalStore.preferredTheme as Theme;
    }
    setTheme(initTheme);

    mediaQuery.addEventListener('change', themeListener);
  }
});

const themeListener = (e: MediaQueryListEvent) => {
  // if (localStorage.getItem('theme')) return;
  if (globalStore.preferredTheme) return;
  setTheme(e.matches ? 'dark' : 'light');
}

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', themeListener);
  window.removeEventListener('languagechange', () => updateSystemLanguage(null));
});

import UserActionDialog from "@/components/user/basic/UserActionDialog.vue";
import Settings from "@/components/login/setting/Settings.vue";
</script>

<template>
<!--    <router-view class="jus-apollo-page"></router-view>-->
<!--    <Settings class="jus-apollo-page-settings"/>-->


<!--    <UserActionDialog/>-->

  <div class="jus-apollo-page">
    <router-view/>
    <Settings class="jus-apollo-page-settings"/>
    <UserActionDialog/>
  </div>
  <!--  <header>-->
  <!--    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />-->

  <!--    <div class="wrapper">-->
  <!--      <HelloWorld msg="You did it!" />-->
  <!--      <p>Test</p>-->
  <!--    </div>-->
  <!--  </header>-->

  <!--  <main>-->

  <!--  <LoginPage/>-->

  <!--  <div class="jus-apollo-page">-->
  <!--    <SecurityPage/>-->
  <!--  </div>-->


  <!--  </main>-->
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

/*
header {
  line-height: 1.5;
}

main {
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

 */
</style>
