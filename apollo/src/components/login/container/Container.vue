<script setup lang="ts">
import {ref, computed, ComputedRef, VNode, RendererNode, RendererElement, h} from 'vue'
import type {Component} from "vue"
import CustomInputLong from '../basic/InputLong.vue'
import passkeys from "@/assets/logo/passkeys_20x20.svg"
import google from "@/assets/logo/google_20x20.svg"
import gitHub from "@/assets/logo/github_20x20.svg"
import Divider from "../basic/Divider.vue";
import {ElButton} from "element-plus";
import ThirdPartyButton from "@/components/login/basic/ThirdPartyButton.vue";
import {cf_token} from '@/assets/logic/cloudflareTurnstile';
import CloudflareTurnstile from "@/components/CloudflareTurnstile.vue";
import {LoginFormData, Register, RegisterFormData} from "@/api/AccountActions";
import {Login} from "@/api/AccountActions"
import { useRouter } from 'vue-router';
const router = useRouter();
import {useI18n} from 'vue-i18n'

const {t, locale} = useI18n()

function sideToButtonClass(id: number) {
  const classNames: string[] = ['jus-apollo-container-title-spacing', 'jus-apollo-container-text-spacing', 'container-action-button-zh-spacing']
  if (locale.value === 'zh') {
    return classNames[id];
  } else {
    return '';
  }
}

const forgetPassword: ComputedRef<string> = computed(() => t('container.login.FORGET_PASSWORD'))
const passkeysText: ComputedRef<string> = computed(() => t('container.THIRD_PARTY.PASSKEYS'))
const googleText: ComputedRef<string> = computed(() => t('container.THIRD_PARTY.GOOGLE'))
const githubText: ComputedRef<string> = computed(() => t('container.THIRD_PARTY.GITHUB'))

interface ThirdPartyProvider {
  icon: Component
  text: ComputedRef<string>
}

const thirdPartyProviders: ThirdPartyProvider[] = [
  {icon: passkeys, text: passkeysText},
  {icon: google, text: googleText},
  {icon: gitHub, text: githubText}
]
import {useSessionStore, useLocalStore} from "@/store";

const sessionStore = useSessionStore();
const localStore = useLocalStore();

const containerTitle: ComputedRef<string> = computed(() => sessionStore.isLogin ? t('container.login.CONTAINER_TITLE') : t('container.registration.CONTAINER_TITLE'))
const containerText: ComputedRef<string> = computed(() => sessionStore.isLogin ? t('container.login.CONTAINER_TEXT') : t('container.registration.CONTAINER_TEXT'))
const dividerText: ComputedRef<string> = computed(() => t('container.THIRD_PARTY.THIRD_PARTY_CONTINUE'))
const containerActionButtonText: ComputedRef<string> = computed(() => sessionStore.isLogin ? t('container.login.LOGIN_BUTTON') : t('container.registration.REGISTER_BUTTON'))
const containerActionButton: ComputedRef<VNode<RendererNode, RendererElement, { [p: string]: any }>> = computed(() => {
  return h(
      ElButton,
      {
        style: {
          backgroundColor: 'var(--jus-color-login-container-action-button-background)',
          letterSpacing: locale.value === 'zh' ? '0.1875rem' : 'normal',
          color: 'var(--jus-color-global-neutrals-pure-black)'
        },
        disabled: isButtonDisabled.value,
        onClick: sessionStore.isLogin ? handleLogin : handleRegister,
      },
      () => containerActionButtonText.value
  );
});

const isButtonDisabled = computed(() => {
  if (sessionStore.isLogin) {
    return !loginData.value.email || !loginData.value.password || !cf_token.value;
  } else {
    return !registerData.value.email ||
        !registerData.value.password ||
        !registerData.value.confirmPassword ||
        registerData.value.password != registerData.value.confirmPassword ||
        !cf_token.value;
  }
})

function switchPanel(): void {
  sessionStore.isLogin = !sessionStore.isLogin
  if (sessionStore.isLogin) {
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

// 表单数据
const registerData = ref({
  email: '',
  password: '',
  confirmPassword: ''
})
// 配置每个字段的类型和 placeholder
const registerFields = {
  email: {type: 'email', placeholder: 'Email'},
  password: {type: 'password', placeholder: 'Password'},
  confirmPassword: {type: 'password', placeholder: 'ConfirmPassword'}
}

const loginData = ref({
  email: '',
  password: '',
})
const loginFields = {
  email: {type: 'email', placeholder: 'Email'},
  password: {type: 'password', placeholder: 'Password'},
}

// 表单验证
const isFormValid = computed(() => {
  return registerData.value.email &&
      registerData.value.password &&
      registerData.value.confirmPassword &&
      registerData.value.password === registerData.value.confirmPassword
})

import {RegisterResponseData} from "@/api/AccountActions";

const handleRegister = async () => {
  if (!isFormValid.value && !cf_token.value) {
    console.log('无注册数据:', registerData.value)
    // 这里添加注册逻辑
  }

  emit('update:isWaitingForServer', true);

  let language;
  if (sessionStore.language) {
    language = sessionStore.language;
  } else {
    language = navigator.language || (navigator as any).userLanguage || 'en';
  }
  const data: RegisterFormData = {
    email: registerData.value.email,
    password: registerData.value.password,
    confirmedPassword: registerData.value.confirmPassword,
    language: language,
    cloudflareToken: cf_token.value,
  }
  try {
    const response: AxiosResponse<RegisterResponseData> = await Register(data)
    if (response.status != 200 || response.data.code != 200) {
      emit('update:isWaitingForServer', false);
      console.log(registerData.value)
      console.log('failed', response.data.code, response.data.message)
      return;
    }

    localStore.token = response.data.data.token;
    await router.push({name: 'User'});
  } catch (error) {
    console.log(error)
  }
  emit('update:isWaitingForServer', false);
}

const showLoginTurnstile = ref(false)
const showRegisterTurnstile = ref(false)
watch(
    () => sessionStore.isLogin,
    (isLogin) => {
      if (isLogin) {
        showRegisterTurnstile.value = false
        // showLoginTurnstile.value = true
        setTimeout(() => (showLoginTurnstile.value = true), 2000)
      } else {
        showLoginTurnstile.value = false
        // showRegisterTurnstile.value = true
        setTimeout(() => (showRegisterTurnstile.value = true), 2000)
      }
    },
    {immediate: true}
)

import {watch} from 'vue'
import {AxiosResponse} from "axios";

const handleLogin = async () => {
  if (!loginData.value.email || !loginData.value.password || !cf_token.value) {
    console.log('nothing')
    return
  }
  emit('update:isWaitingForServer', true);
  const data: LoginFormData = {
    email: loginData.value.email,
    password: loginData.value.password,
    cloudflareToken: cf_token.value,
  }
  try {
    const response = await Login(data)
    console.log(response)
    if (response.status === 200) {
      if (response.data && response.data.code === 200) {
        // save token
        localStore.token = response.data.data.token;
        // set language
        if (response.data.data.language) {
          let lang = response.data.data.language.split('-')[0]
          sessionStore.user.info.language = lang;
          sessionStore.language = lang;
          switchLanguage(lang)
          sessionStore.setActionCardStatus(0, sessionStore.actionsIds.infoActions[3], false);
        }
        // short info
        sessionStore.user.id = response.data.data.id;
        sessionStore.user.info.name.givenName = response.data.data.name.givenName;
        sessionStore.user.info.name.middleName = response.data.data.name.middleName;
        sessionStore.user.info.name.familyName = response.data.data.name.familyName;
        sessionStore.setActionCardStatus(0, sessionStore.actionsIds.infoActions[0], false);
        sessionStore.user.avatar = response.data.data.avatar;

        // info
        sessionStore.user.info.birthday.year = response.data.data.birthday.year
        sessionStore.user.info.birthday.month = response.data.data.birthday.month
        sessionStore.user.info.birthday.day = response.data.data.birthday.day
        sessionStore.setActionCardStatus(0, sessionStore.actionsIds.infoActions[1], false);

        sessionStore.user.info.locale = response.data.data.locale;
        sessionStore.setActionCardStatus(0, sessionStore.actionsIds.infoActions[2], false);

        await router.push({name: 'User'});
      }
    }
  } catch (error) {
    console.log(error)
    console.log('failed')
  }

  emit('update:isWaitingForServer', false);
}

defineProps<{
  isWaitingForServer: boolean;
}>()

const emit = defineEmits<{
  (e: 'update:isWaitingForServer', value: boolean): void
}>()
</script>

<template>
  <div class="jus-apollo-container">
    <!-- Register -->
    <div class="jus-apollo-container-top-section" v-show="!sessionStore.isLogin">
      <!-- 标题 -->
      <div :class="['jus-apollo-container-title', sideToButtonClass(0)]">{{ containerTitle }}</div>
      <div :class="['jus-apollo-container-text', sideToButtonClass(1)]">{{ containerText }}</div>
      <CustomInputLong
          v-for="(field, key) in registerFields"
          :key="key"
          class="jus-apollo-container-input"
          v-model="registerData[key]"
          :placeholder="field.placeholder"
          :type="field.type"
      />
      <CloudflareTurnstile :show="showRegisterTurnstile" action="register"/>
      <div class="jus-apollo-container-action-section register">
        <component :is="containerActionButton" :class="['container-action-button', sideToButtonClass(2)]"/>
      </div>
    </div>

    <!-- Login   -->
    <div class="jus-apollo-container-top-section" v-show="sessionStore.isLogin">
      <!-- 标题 -->
      <div :class="['jus-apollo-container-title', sideToButtonClass(0)]">{{ containerTitle }}</div>
      <div :class="['jus-apollo-container-text', sideToButtonClass(1)]">{{ containerText }}</div>
      <CustomInputLong
          v-for="(field, key) in loginFields"
          :key="key"
          class="jus-apollo-container-input"
          v-model="loginData[key]"
          :placeholder="field.placeholder"
          :type="field.type"
      />
      <CloudflareTurnstile :show="showLoginTurnstile" action="login"/>
      <div class="jus-apollo-container-action-section">
        <span class="jus-apollo-container-action-section-text">{{ forgetPassword }}</span>
        <component :is="containerActionButton" :class="['container-action-button', sideToButtonClass(2)]"/>
      </div>
    </div>


    <!-- 底部第三方登录区域 -->
    <div class="jus-apollo-container-bottom-section">
      <Divider class="jus-apollo-container-bottom-section-divider" :text="dividerText"/>
      <div class="jus-apollo-container-bottom-section-third-party-buttons">
        <ThirdPartyButton
            v-for="(provider, index) in thirdPartyProviders"
            :key="index"
            :icon="provider.icon"
            :text="provider.text"
            @click="switchPanel"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/login/container/index.css";

.cloudflare-turnstile-container {
  width: 21.875rem;
  height: 3.5rem;
  align-items: center;
  justify-content: center;
  padding-top: 0.2rem;
  display: flex;
  overflow: hidden;

  flex-shrink: 0;

  border-radius: 0.5rem;
  background: var(--jus-color-doraemon-surface);

  /* Input/Inner Default */
  /*box-shadow: -2px -2px 4px 0 var(--jus-color-global-shadow-bottom-right) inset, 2px 2px 4px 0 var(--jus-color-global-shadow-top-left) inset;

   */
  box-shadow: 0 1px inset var(--jus-color-icarus-surface);
}

.jus-apollo-container {
  display: flex;
  width: 37.5rem;
  height: 43.75rem;
  padding: 2.8125rem 2.9375rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.875rem;
  flex-shrink: 0;
  font-family: "PingFang SC", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background-color: transparent;
  /*
    background: linear-gradient(148deg, var(--jus-color-icarus-primary-200, #F9E8E7) 31.82%, var(--jus-color-icarus-primary-300, #F4BEBD) 106.82%);
   */
  transition: all 5s ease-in-out 0s;
  /*
  background: linear-gradient(91deg, rgba(255, 255, 255, 0.30) 0%, rgba(191, 184, 184, 0.09) 100%);
  */
}

.jus-apollo-container-top-section {
  display: flex;
  height: 22.5rem;
  flex-direction: column;
  align-items: center;
  gap: 1.125rem;
  flex-shrink: 0;
  align-self: stretch;
}

.jus-apollo-container-title {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--jus-color-global-neutrals-text-primary);
  text-overflow: ellipsis;
  font-size: 2rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2.25rem;
  white-space: nowrap;
}

.jus-apollo-container-title-spacing {
  letter-spacing: 0.6rem;
}

.jus-apollo-container-text-spacing {
  letter-spacing: -0.07rem;
}

.jus-apollo-container-action-section-text {
  display: flex;
  height: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  color: var(--jus-color-global-neutrals-text-primary);
  text-align: center;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5rem; /* 171.429% */
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;

  cursor: pointer;
}

.jus-apollo-container-action-section.register {
  margin-top: -0.5rem;
}

.jus-apollo-container-action-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 0.625rem;
}

.jus-apollo-container-text {
  display: flex;
  height: 1.5rem;
  justify-content: center;
  align-items: center;

  color: var(--jus-color-global-neutrals-text-primary);
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5rem; /* 150% */
}

.jus-apollo-container-input {
  display: flex;
  width: 21.875rem;
  height: 2.5rem;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
}

.jus-apollo-container-bottom-section {
  height: 13.75rem;
  flex-shrink: 0;
  align-self: stretch;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.jus-apollo-container-bottom-section-divider {
  width: 31.625rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.jus-apollo-container-bottom-section-third-party-buttons {
  width: 21rem;
  height: 11.3125rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.cloudflare-checker-container {
  width: 100%;
  height: 40px;
}
</style>
