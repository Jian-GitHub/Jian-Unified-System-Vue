<script setup lang="ts">

// Figma assets
import {ComputedRef, ref} from "vue";
import CircleTop from "@/components/login/basic/circleTop.vue";
import CircleBottom from "@/components/login/basic/circleBottom.vue";

let isLogin = ref(true);

function setIsLogin() {
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

import {useI18n} from 'vue-i18n'

const {t, locale} = useI18n()

import {computed} from 'vue'

const isDark: ComputedRef<boolean> = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'dark'
})
const title = computed(() => t('side.SIDE_TITLE'))
const loginSideText1 = computed(() => t('side.login.SIDE_TEXT_1'))
const loginSideText2 = computed(() => t('side.login.SIDE_TEXT_2'))
const registerSideText1 = computed(() => t('side.registration.SIDE_TEXT_1'))
const registerSideText2 = computed(() => t('side.registration.SIDE_TEXT_2'))
const loginButtonText = computed(() => t('side.login.TO_REGISTER'))
const registerButtonText = computed(() => t('side.registration.TO_LOGIN'))

function setTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme) // 可选，持久化保存
}

// 切换语言
const switchLanguage = (lang: string) => {
  locale.value = lang
}
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
      <el-button :class="['btn', { 'btn-zh-spacing': locale === 'zh' }]"
                 color="var(--jus-color-doraemon-primary-200)"
                 :dark="isDark"
                 @click="setIsLogin">
        {{ isLogin ? loginButtonText : registerButtonText }}
      </el-button>
    </div>
  </div>

</template>

<style scoped>
@import "@/assets/main.css";

.jus-apollo-side {
  position: relative;
  width: 400px;
  height: 700px;
  background: var(--jus-color-icarus-primary-200);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: "PingFang SC", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  transition: all 1s ease-in-out; /* 平滑动画 */
}

.jus-apollo-side-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
/*noinspection CssUnusedSymbol*/
.circle {
  position: absolute;
  pointer-events: none;
  transition: all 1s ease-in-out; /* 平滑动画 */
}
/*noinspection CssUnusedSymbol*/
.circle--top-right {
  width: 18.75rem;
  height: 18.75rem;
  left: calc(50% + 13.375rem);
  top: calc(50% - 25.625rem);
  transform: translate(-50%, -50%);
}
/*noinspection CssUnusedSymbol*/
.circle--top-left {
  width: 18.75rem;
  height: 18.75rem;
  left: calc(50% - 13.375rem);
  top: calc(50% - 25.625rem);
  transform: translate(-50%, -50%);
}
/*noinspection CssUnusedSymbol*/
.circle--bottom-left {
  width: 31.25rem;
  height: 31.25rem;
  left: calc(50% - 12rem);
  top: calc(50% + 28.25rem);
  transform: translate(-50%, -50%);
}
/*noinspection CssUnusedSymbol*/
.circle--bottom-right {
  width: 31.25rem;
  height: 31.25rem;
  left: calc(50% + 12rem);
  top: calc(50% + 28.25rem);
  transform: translate(-50%, -50%);
}

.title {
  color: var(--jus-color-global-neutrals-text-primary);
  font-size: 2.00938rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2.5rem; /* 124.417% */
  letter-spacing: 0.04019rem;
}

.text {
  color: var(--jus-color-global-neutrals-text-primary);
  text-align: center;
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.875rem; /* 187.5% */
}

.btn {
  width: 11.25rem;
  height: 3.125rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border: none;
  cursor: pointer;

  text-align: center;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 600;
  line-height: 1.5rem; /* 120% */
  transition: 0s;
}
/*noinspection CssUnusedSymbol*/
.btn-zh-spacing {
  letter-spacing: 0.1875rem;
}
</style>