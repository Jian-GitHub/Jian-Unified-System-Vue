<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue';
import LoginPage from '@/components/login/LoginPage.vue'
import SecurityPage from "@/components/user/security/SecurityPage.vue";

import {useI18n} from "vue-i18n";

const {locale} = useI18n()

// Theme mode type
type Theme = 'light' | 'dark';

// listener
let mediaQuery: MediaQueryList | null = null;

const setTheme = (mode: Theme) => {
  document.documentElement.setAttribute('data-theme', mode);
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
  const savedLanguage: string | null = localStorage.getItem('language');
  if (savedLanguage === null) {
    // init system language
    updateSystemLanguage(null);
  } else {
    updateSystemLanguage(savedLanguage);
  }
  // watch system language changes
  window.addEventListener('languagechange', () => updateSystemLanguage(null));

  // check system mode
  if (window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let initTheme: Theme = mediaQuery.matches ? 'dark' : 'light';
    const savedTheme: string | null = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      initTheme = savedTheme as Theme;
    }
    setTheme(initTheme);

    mediaQuery.addEventListener('change', themeListener);
  }
});

const themeListener = (e: MediaQueryListEvent) => {
  if (localStorage.getItem('theme')) return;
  setTheme(e.matches ? 'dark' : 'light');
}

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', themeListener);
  window.removeEventListener('languagechange', () => updateSystemLanguage(null));
});

</script>

<template>
  <!--  <header>-->
  <!--    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />-->

  <!--    <div class="wrapper">-->
  <!--      <HelloWorld msg="You did it!" />-->
  <!--      <p>Test</p>-->
  <!--    </div>-->
  <!--  </header>-->

  <!--  <main>-->

<!--  <LoginPage/>-->

  <div class="jus-apollo-page">
    <SecurityPage/>
  </div>


  <!--  </main>-->
</template>

<style scoped>
.jus-apollo-page {
  width: 100vw;
  height: 100vh;
  background: var(--jus-color-doraemon-surface);

  /* 内部填充的半透明背景色 */
  background: rgba(255, 255, 255, 0.06) linear-gradient(
      120deg,
      var(--jus-color-global-shadow-top-left) 30%,
      var(--jus-color-global-shadow-bottom-right) 60%
  );
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
