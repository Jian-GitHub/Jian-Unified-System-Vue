<script setup lang="ts">
import {ref, computed, ComputedRef, VNode, RendererNode, RendererElement, h, Ref} from 'vue'
import type {Component} from "vue"
import CustomInput from '../basic/Input.vue'


import passkeys from "@/assets/logo/passkeys_20x20.svg"
import google from "@/assets/logo/google_20x20.svg"
import gitHub from "@/assets/logo/github_20x20.svg"
import Divider from "../basic/divider.vue";
import CloudflareChecker from '../basic/CloudflareChecker.vue'
import {ElButton} from "element-plus";
import ThirdPartyButton from "@/components/login/basic/ThirdPartyButton.vue";
// import VueTurnstile from 'vue-turnstile';


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
import {store} from "@/store";
let {isLogin} = store()

const containerTitle: ComputedRef<string> = computed(() => isLogin.value ? t('container.login.CONTAINER_TITLE') : t('container.registration.CONTAINER_TITLE'))
const containerText: ComputedRef<string> = computed(() => isLogin.value ? t('container.login.CONTAINER_TEXT') : t('container.registration.CONTAINER_TEXT'))
const dividerText: ComputedRef<string> = computed(() => t('container.THIRD_PARTY.THIRD_PARTY_CONTINUE'))
const containerActionButtonText: ComputedRef<string> = computed(() => isLogin.value ? t('container.login.LOGIN_BUTTON') : t('container.registration.REGISTER_BUTTON'))
const containerActionButton: ComputedRef<VNode<RendererNode, RendererElement, { [p: string]: any }>> = computed(() => {
  return h(
      ElButton,
      {
        style: {
          backgroundColor: 'var(--jus-color-login-container-action-button-background)',
          letterSpacing: locale.value === 'zh' ? '0.1875rem' : 'normal',
          color: 'var(--jus-color-global-neutrals-pure-black)'
        },
        onClick: handleRegister,
      },
      () => containerActionButtonText.value
  );
});


// let isLogin = true;

function setIsLogin(): void {
  isLogin.value = !isLogin
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

function triggerTurnstile() {
  // 调用 Turnstile 的执行方法
  // vue-turnstile 暂时没有官方 execute 接口，但可以用 ref 触发
  if (this.$refs.turnstileRef) {
    this.$refs.turnstileRef.reset(); // 重置，确保可触发
  }
}

// 验证回调
function onVerify(token) {
  cf_token.value = token;
  console.log('Turnstile token:', token);

  // 在这里调用你的后端接口验证 token
  // axios.post('/api/verify-token', { token }).then(...)
}

// 表单数据
const formData = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证
const isFormValid = computed(() => {
  return formData.value.email &&
      formData.value.password &&
      formData.value.confirmPassword &&
      formData.value.password === formData.value.confirmPassword
})

// 注册处理
const handleRegister = () => {
  if (isFormValid.value) {
    console.log('注册数据:', formData.value)
    // 这里添加注册逻辑
  }
}

const cf_token = ref('');
</script>

<template>
  <div class="jus-apollo-container">
    <!-- Register -->
    <div class="jus-apollo-container-top-section" v-if="!isLogin">
      <!-- 标题 -->
      <div :class="['jus-apollo-container-title', sideToButtonClass(0)]">{{ containerTitle }}</div>
      <div :class="['jus-apollo-container-text', sideToButtonClass(1)]">{{ containerText }}</div>
      <CustomInput
          class="jus-apollo-container-input"
          v-model="formData.email"
          placeholder="Email"
          type="email"
      />
      <CustomInput
          class="jus-apollo-container-input"
          v-model="formData.password"
          placeholder="Password"
          type="password"
          show-password
      />
      <CustomInput
          class="jus-apollo-container-input"
          v-model="formData.confirmPassword"
          placeholder="ConfirmPassword"
          type="password"
          show-password
      />
      <!-- Cloudflare Check -->
      <!--        <div class="cloudflare-checker-container" data-name="Cloudflare Checker" data-node-id="89:314">-->
      <!--          <CloudflareChecker />-->
      <!--        </div>-->
      <!--      <div-->
      <!--          style="width: 375px;height: 65px;background-color: #fafafa;border-radius: 8px;align-items: center;justify-content: center;display: flex;overflow: hidden;">-->
      <!--        <p style="z-index: 0;position: absolute;width: 375px;">等待验证</p>-->
      <!--        <vue-turnstile style="width: 375px;z-index: 1;position: absolute" id="cf"-->
      <!--                       site-key="0x4AAAAAAANVWc7MkXgqcP22" v-model="cf_token" theme="light"/>-->
      <!--      </div>-->
      <CloudflareChecker/>
      <div>
        <component :is="containerActionButton" :class="['container-action-button', sideToButtonClass(2)]"/>
      </div>
    </div>

    <!-- Login   -->
    <div class="jus-apollo-container-top-section" v-if="isLogin">
      <!-- 标题 -->
      <div :class="['jus-apollo-container-title', sideToButtonClass(0)]">{{ containerTitle }}</div>
      <div :class="['jus-apollo-container-text', sideToButtonClass(1)]">{{ containerText }}</div>
      <CustomInput
          class="jus-apollo-container-input"
          v-model="formData.email"
          placeholder="Email"
          type="email"
          show-password
      />
      <CustomInput
          class="jus-apollo-container-input"
          v-model="formData.password"
          placeholder="Password"
          type="password"
          show-password
      />
      <!-- Cloudflare Checker -->
      <!--        <div class="cloudflare-checker-container" data-name="Cloudflare Checker" data-node-id="89:314">-->
      <!--          <CloudflareChecker />-->
      <!--        </div>-->
      <!--      <div-->
      <!--          style="width: 375px;height: 65px;background-color: #fafafa;border-radius: 8px;align-items: center;justify-content: center;display: flex;overflow: hidden;">-->
      <!--        <p style="z-index: 0;position: absolute;width: 375px;">等待验证</p>-->
      <!--        <vue-turnstile style="width: 375px;z-index: 1;position: absolute" id="cf"-->
      <!--                       site-key="0x4AAAAAAANVWc7MkXgqcP22" v-model="cf_token" theme="light"/>-->
      <!--      </div>-->
      <CloudflareChecker/>
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
            @click="setIsLogin"/>
      </div>
    </div>
  </div>
</template>


<style scoped>
@import "@/assets/css/login/container/index.css";

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

  color: var(--jus-color-global-neutrals-text-primary);
  text-overflow: ellipsis;
  font-size: 2rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2.25rem; /* 112.5% */
  white-space: nowrap; /* 单行显示 */

}

.jus-apollo-container-title-spacing{
  letter-spacing: 0.6rem;
}
.jus-apollo-container-text-spacing{
  letter-spacing: -0.07rem;
}

.jus-apollo-container-action-section-text {
  display: flex;
  /*
  width: 4.375rem;

   */
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
.jus-apollo-container-action-section {
  display: flex;
  padding: 1.5rem 0.625rem 0 0.625rem;
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
  flex-direction: column; /* 垂直排列子元素 */
  align-items: center; /* 水平居中所有子元素 */
  gap: 0.6rem; /* 子元素间垂直间距 */
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
  flex-direction: column; /* 垂直排列子元素 */
  gap: 0.6rem; /* 子元素间垂直间距 */
}


.cloudflare-checker-container {
  width: 100%;
  height: 40px;
}

</style>
