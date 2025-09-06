<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {computed} from 'vue'
import {ElButton} from "element-plus";
// Figma assets
import {h, ComputedRef, Ref, ref, VNode, RendererNode, RendererElement} from "vue";
import CircleTop from "@/components/login/basic/circleTop.vue";
import CircleBottom from "@/components/login/basic/circleBottom.vue";

const {t, locale} = useI18n()

let isLogin: Ref<boolean, boolean> = ref(true);
const title: ComputedRef<string> = computed(() => t('side.SIDE_TITLE'))
const loginSideText1: ComputedRef<string> = computed(() => t('side.login.SIDE_TEXT_1'))
const loginSideText2: ComputedRef<string> = computed(() => t('side.login.SIDE_TEXT_2'))
const registerSideText1: ComputedRef<string> = computed(() => t('side.registration.SIDE_TEXT_1'))
const registerSideText2: ComputedRef<string> = computed(() => t('side.registration.SIDE_TEXT_2'))
const loginButtonText: ComputedRef<string> = computed(() => t('side.login.TO_REGISTER'))
const registerButtonText: ComputedRef<string> = computed(() => t('side.registration.TO_LOGIN'))

function setIsLogin(): void {
  isLogin.value = !isLogin.value
  // console.log(isLogin)

  if (isLogin.value) {
    setTheme('dark')
    switchLanguage('en')
  } else {
    setTheme('light')
    switchLanguage('zh')
  }
}

function setTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

// 切换语言
const switchLanguage = (lang: string): void => {
  locale.value = lang
}

const toButton: ComputedRef<VNode<RendererNode, RendererElement, { [p: string]: any }>> = computed(() => {
  return h(
      ElButton,
      {
        style: {
          backgroundColor: '#E3F2FD', //'var(--jus-color-doraemon-primary-200)'
        },
        onClick: setIsLogin,
      },
      isLogin.value ? loginButtonText.value : registerButtonText.value
  );
});
</script>

<template>
  <div class="jus-apollo-side">
    <div class="jus-apollo-side-background">
      <CircleTop :class="[{ 'circle--top-right' : isLogin }, { 'circle--top-left' : !isLogin }]"/>
      <CircleBottom :class="[ { 'circle--bottom-left' : isLogin }, { 'circle--bottom-right' : !isLogin }]"/>
    </div>

    <div class="jus-apollo-side-content">
      <div class="title">{{ title }}</div>
      <div class="text">
        {{ isLogin ? loginSideText1 : registerSideText1 }}
        <br/>
        {{ isLogin ? loginSideText2 : registerSideText2 }}
      </div>
      <component :is="toButton" :class="['btn', { 'btn-zh-spacing': locale === 'zh' }]"/>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/login/index.css";
</style>