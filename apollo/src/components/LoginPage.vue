<script setup>
import { reactive, ref, computed } from 'vue'

const emit = defineEmits(['login', 'register'])

const isRegisterMode = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const touched = reactive({
  name: false,
  email: false,
  password: false,
  confirmPassword: false
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const errors = computed(() => {
  const e = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
  if (isRegisterMode.value && !form.name.trim()) {
    e.name = '请输入姓名'
  }
  if (!form.email.trim() || !emailRegex.test(form.email)) {
    e.email = '请输入有效的邮箱地址'
  }
  if (form.password.length < 6) {
    e.password = '密码至少 6 位'
  }
  if (isRegisterMode.value) {
    if (!form.confirmPassword) {
      e.confirmPassword = '请再次输入密码'
    } else if (form.confirmPassword !== form.password) {
      e.confirmPassword = '两次输入的密码不一致'
    }
  }
  return e
})

const isValid = computed(() => {
  const e = errors.value
  if (isRegisterMode.value) {
    return !e.name && !e.email && !e.password && !e.confirmPassword
  }
  return !e.email && !e.password
})

function handleSubmit() {
  if (!isValid.value) return
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password
  }
  if (isRegisterMode.value) {
    emit('register', payload)
  } else {
    emit('login', { email: payload.email, password: payload.password })
  }
}

function switchMode() {
  isRegisterMode.value = !isRegisterMode.value
  touched.name = false
  touched.email = false
  touched.password = false
  touched.confirmPassword = false
}

// Figma assets and tokens
const ICON_PASSKEY = 'http://localhost:3845/assets/d59c9d7ef0ec8d553b2edc3147c707798bc0cf86.svg'
const ICON_GOOGLE_1 = 'http://localhost:3845/assets/79a74e71e909a52748e59a5f888ecc0fa51b3785.svg'
const ICON_GOOGLE_2 = 'http://localhost:3845/assets/4e0834d45c4e0c748359f3da00de6582e5123cfe.svg'
const ICON_GOOGLE_3 = 'http://localhost:3845/assets/902c6ccd4cbeeb7dc568bd64b4a218a209749762.svg'
const ICON_GOOGLE_4 = 'http://localhost:3845/assets/1e33633c50877a7a8c09cae1428c114860556bb9.svg'
const ICON_GITHUB = 'http://localhost:3845/assets/cf7cdfdf46b3b4b2b1291a1de8ac0a007cdf4ca1.svg'
const DIVIDER = 'http://localhost:3845/assets/e300ebad51e7c86cd9a45b8701ade0c31fff54cb.svg'
const SUCCESS_CIRCLE = 'http://localhost:3845/assets/16df472de1c209d2f4ddc35b6d5e077e67051bb1.svg'
const SUCCESS_TICK = 'http://localhost:3845/assets/1f8cbec1293c1ab43e850482e04209a70286b0bc.svg'
const CF_TEXT = 'http://localhost:3845/assets/81c12b03a9b2a906b18cdd486c01d5d8ea5c1850.svg'
const CF_LOGO = 'http://localhost:3845/assets/d0297e424c8420be361fcd51ac6b010d8ff69bcf.svg'
const CIRCLE_TOP = 'http://localhost:3845/assets/d12e4329d2090de7573d1f8cdcbaefeef1b3fb0f.svg'
const CIRCLE_BOTTOM = 'http://localhost:3845/assets/a8e8084436ae9271890d62fa1c3ce86854bf4263.svg'
</script>

<template>
  <div class="shell">
    <div class="side" data-node-id="107:820">
      <img class="circle circle--top" :src="CIRCLE_TOP" alt="" />
      <img class="circle circle--bottom" :src="CIRCLE_BOTTOM" alt="" />

      <div class="brand">Jian Unified System</div>
      <div class="promo">还没有账号吗？<br/>现在注册，即刻启程！</div>
      <button class="btn-secondary" type="button" @click="switchMode" v-if="!isRegisterMode">前往注册</button>
      <button class="btn-secondary" type="button" @click="switchMode" v-else>返回登录</button>
    </div>

    <div class="content" data-node-id="106:595">
      <div class="title">登 入 账 号</div>
      <div class="subtitle">选择登录方式或电子邮箱登录</div>

      <form class="form" @submit.prevent="handleSubmit">
        <div v-if="isRegisterMode" class="field">
          <input class="neu-input" id="name" type="text" v-model.trim="form.name" @blur="touched.name = true" placeholder="Name" autocomplete="name" />
          <p v-if="touched.name && errors.name" class="error">{{ errors.name }}</p>
        </div>

        <div class="field">
          <input class="neu-input" id="email" type="email" v-model.trim="form.email" @blur="touched.email = true" placeholder="Email" autocomplete="email" />
          <p v-if="touched.email && errors.email" class="error">{{ errors.email }}</p>
        </div>

        <div class="field">
          <input class="neu-input" id="password" type="password" v-model="form.password" @blur="touched.password = true" placeholder="Password" autocomplete="current-password" />
          <p v-if="touched.password && errors.password" class="error">{{ errors.password }}</p>
        </div>

        <div class="cloudflare">
          <div class="cf-status">
            <img class="cf-icon" :src="SUCCESS_CIRCLE" alt="" />
            <img class="cf-tick" :src="SUCCESS_TICK" alt="" />
            <span>成功！</span>
          </div>
          <div class="cf-brand">
            <img :src="CF_LOGO" alt="Cloudflare" />
            <img :src="CF_TEXT" alt="" />
          </div>
        </div>

        <div class="forget">忘记密码?</div>

        <button class="btn-primary" type="submit" :disabled="!isValid">登 录</button>
      </form>

      <div class="divider">
        <img :src="DIVIDER" alt="" />
        <span>使用第三方继续</span>
      </div>

      <div class="oauth">
        <button class="btn-oauth">
          <img class="icon" :src="ICON_PASSKEY" alt="" />
          <span>使用通行密钥继续</span>
        </button>
        <button class="btn-oauth">
          <span class="icon google">
            <img :src="ICON_GOOGLE_1" alt="" />
            <img :src="ICON_GOOGLE_2" alt="" />
            <img :src="ICON_GOOGLE_3" alt="" />
            <img :src="ICON_GOOGLE_4" alt="" />
          </span>
          <span>使用Google继续</span>
        </button>
        <button class="btn-oauth">
          <img class="icon" :src="ICON_GITHUB" alt="" />
          <span>使用GitHub继续</span>
        </button>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #ffffff;
}

.shell > .content,
.shell > .side {
  font-family: "PingFang SC", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.shell {
  /* outer neumorphic shell */
}

.shell::before {
  content: "";
  display: block;
}

.shell > .side,
.shell > .content {
  height: 700px;
}

.shell {
  width: 1080px;
}

.shell {
  /* card */
}

.shell > .side,
.shell > .content,
.shell {
  border-radius: 12px;
}

.shell {
  box-shadow: 10px 10px 10px #f9f9f9, -10px -10px 10px #d1d9e6;
}

.shell {
  display: grid;
  grid-template-columns: 400px 1fr;
  overflow: hidden;
}

.side {
  background: #f9e8e7;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
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
  margin-top: 120px;
}

.promo {
  color: #212121;
  font-size: 16px;
  text-align: center;
}

.btn-secondary {
  width: 180px;
  height: 50px;
  border-radius: 8px;
  background: #fafafa;
  box-shadow: 0 4px 4px rgba(0,0,0,0.25);
  border: none;
  font-size: 20px;
  color: #212121;
  margin-top: 20px;
  cursor: pointer;
}

.content {
  background: #f9e8e7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 45px 47px;
  gap: 30px;
}

.title {
  font-weight: 600;
  font-size: 32px;
  color: #212121;
  letter-spacing: 9.6px;
}

.subtitle {
  font-size: 16px;
  color: #212121;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.neu-input {
  width: 350px;
  height: 40px;
  border-radius: 8px;
  padding: 0 20px;
  background: #fafafa;
  border: none;
  outline: none;
  box-shadow: -2px -2px 4px inset #f9f9f9, 2px 2px 4px inset #d1d9e6;
  font-size: 12px;
  color: #a9a9a9;
}

.error {
  color: #dc2626;
  font-size: 12px;
  line-height: 1.2;
}

.cloudflare {
  width: 506px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;
  padding: 0 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.cf-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #212121;
  font-size: 12px;
}
.cf-icon { width: 20px; height: 20px; }
.cf-tick { width: 20px; height: 20px; margin-left: -28px; }
.cf-brand { display: flex; align-items: center; gap: 8px; opacity: .8; }
.cf-brand img { height: 20px; }

.forget {
  align-self: flex-end;
  margin-top: 6px;
  color: #212121;
  font-size: 14px;
  text-decoration: underline;
}

.btn-primary {
  width: 180px;
  height: 50px;
  border-radius: 8px;
  background: #f4bebd;
  box-shadow: 0 4px 4px rgba(0,0,0,0.25);
  border: none;
  font-size: 20px;
  color: #000;
  cursor: pointer;
}

.divider {
  width: 506px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -4px;
}
.divider img { width: 100%; height: 0; border: none; }
.divider span {
  position: absolute;
  background: transparent;
  color: #212121;
  font-size: 16px;
}

.oauth {
  display: grid;
  gap: 16px;
}
.btn-oauth {
  width: 336px;
  height: 50px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 4px rgba(0,0,0,0.25);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #212121;
  font-size: 16px;
  cursor: pointer;
}
.btn-oauth .icon { width: 24px; height: 24px; display: inline-block; }
.btn-oauth .google { position: relative; width: 24px; height: 24px; }
.btn-oauth .google img { position: absolute; inset: 0; }
</style>


