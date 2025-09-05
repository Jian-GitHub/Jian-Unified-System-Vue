<script setup lang="ts">

// Figma assets
import CIRCLE_TOP from "@/assets/login/circle_top.svg"
import CIRCLE_BOTTOM  from '@/assets/login/circle_bottom.svg'
import {ref} from "vue";

let isLogin = ref(true);

function setIsLogin() {
  isLogin.value = !isLogin.value
  // console.log(isLogin)

  if (isLogin.value) {
    switchLanguage('en-US')
    setTheme('dark')
  } else {
    switchLanguage('zh-CN')
    setTheme('light')
  }
}

import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

import { computed } from 'vue'
const msg = computed(() => t('side.login.SIDE_TEXT_1'))

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
  <div class="jus-apollo-side" v-if="isLogin">
    <img class="circle circle--top" :src="CIRCLE_TOP" alt="" />
    <img class="circle circle--bottom" :src="CIRCLE_BOTTOM" alt="" />

    <div class="brand">Jian Unified System</div>
    <div class="promo">{{ msg }}<br/>{{$t('side.login.SIDE_TEXT_2')}}</div>

    <button class="btn" type="button" @click="setIsLogin">
      前往注册
    </button>
  </div>

  <div class="jus-apollo-side" v-else-if="!isLogin">
    <img class="circle circle--top" :src="CIRCLE_TOP" alt="" />
    <img class="circle circle--bottom" :src="CIRCLE_BOTTOM" alt="" />

    <div class="brand">Jian Unified System</div>
    <div class="promo">{{ msg }}<br/>{{$t('side.registration.SIDE_TEXT_2')}}</div>

    <button class="btn" type="button" @click="setIsLogin">
      前往登入
    </button>
  </div>

</template>

<style scoped>
@import "@/assets/colors/themes/light.css";
@import "@/assets/colors/themes/dark.css";

.jus-apollo-side {
  position: relative;
  width: 400px;
  height: 700px;
  background: var(--jus-color-doraemon-primary-200);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: "PingFang SC", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.circle {
  position: absolute;
  pointer-events: none;
}
.circle--top {
  width: 300px;
  height: 300px;
  left: calc(50% + 214px);
  top: calc(50% - 410px);
  transform: translate(-50%, -50%);
}
.circle--bottom {
  width: 500px;
  height: 500px;
  left: calc(50% - 192px);
  top: calc(50% + 452px);
  transform: translate(-50%, -50%);
}

.brand {
  font-weight: 600;
  font-size: 32px;
  color: #212121;
}

.promo {
  color: #212121;
  font-size: 16px;
  text-align: center;
  line-height: 30px;
}

.btn {
  width: 180px;
  height: 50px;
  border-radius: 8px;
  background: var(--jus-color-global-neutrals-pure-white);
  box-shadow: 0 4px 4px rgba(0,0,0,0.25);
  border: none;
  font-size: 20px;
  color: #212121;
  letter-spacing: 3px;
  cursor: pointer;
}
</style>