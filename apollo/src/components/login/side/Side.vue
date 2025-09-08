<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {computed} from 'vue'
import {ElButton} from "element-plus";
import {store} from "@/store";
const {isLogin} = store()
// Figma assets
import {h, ComputedRef, Ref, ref, VNode, RendererNode, RendererElement} from "vue";
import CircleTop from "@/components/login/basic/CircleTop.vue";
import CircleBottom from "@/components/login/basic/CircleBottom.vue";

const {t, locale} = useI18n()

const title: ComputedRef<string> = computed(() => t('side.SIDE_TITLE'))
const loginSideText1: ComputedRef<string> = computed(() => t('side.login.SIDE_TEXT_1'))
const loginSideText2: ComputedRef<string> = computed(() => t('side.login.SIDE_TEXT_2'))
const registerSideText1: ComputedRef<string> = computed(() => t('side.registration.SIDE_TEXT_1'))
const registerSideText2: ComputedRef<string> = computed(() => t('side.registration.SIDE_TEXT_2'))
const loginButtonText: ComputedRef<string> = computed(() => t('side.login.TO_REGISTER'))
const registerButtonText: ComputedRef<string> = computed(() => t('side.registration.TO_LOGIN'))
const sideTextLine1: ComputedRef<string> = computed(() => isLogin.value ? loginSideText1.value : registerSideText1.value)
const sideTextLine2: ComputedRef<string> = computed(() => isLogin.value ? loginSideText2.value : registerSideText2.value)

function setIsLogin(): void {
  isLogin.value = !isLogin.value
}

const sideToButton: ComputedRef<VNode<RendererNode, RendererElement, { [p: string]: any }>> = computed(() => {
  return h(
      ElButton,
      {
        style: {
          backgroundColor: '#E3F2FD', //'var(--jus-color-doraemon-primary-200)'
        },
        color: '#E3F2FD',
        onClick: setIsLogin,
      },
      () => isLogin.value ? loginButtonText.value : registerButtonText.value
  );
});

function sideCircleClass(position: 'top' | 'bottom'): string {
  if (position === 'top') {
    return isLogin.value ? 'jus-apollo-side-circle--top-right' : 'jus-apollo-side-circle--top-left'
  } else {
    return isLogin.value ? 'jus-apollo-side-circle--bottom-left' : 'jus-apollo-side-circle--bottom-right'
  }
}

function sideToButtonClass() {
  if (locale.value === 'zh') {
    return 'sideToButton-zh-spacing'
  }
}
</script>

<template>
  <div class="jus-apollo-side">
    <div class="jus-apollo-side-background">
      <CircleTop :class="sideCircleClass('top')"/>
      <CircleBottom :class="sideCircleClass('bottom')"/>
    </div>
    <div class="jus-apollo-side-content">
      <div class="jus-apollo-side-title">{{ title }}</div>
      <div class="jus-apollo-side-text">
        {{ sideTextLine1 }}
        <br/>
        {{ sideTextLine2 }}
      </div>
      <component :is="sideToButton" :class="['sideToButton', sideToButtonClass()]"/>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/login/side/index.css";
</style>