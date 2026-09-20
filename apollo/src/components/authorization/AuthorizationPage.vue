<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/api/axiosInstance'
import { useLocalStore, useSessionStore } from '@/store'
import { clearAuthorization } from '@/utils/sso'
const route = useRoute()
const router = useRouter()
const waiting = ref(false)
const error = ref('')
const zh = computed(() => String(useSessionStore().language).startsWith('zh'))
const value = (name: string) => typeof route.query[name] === 'string' ? route.query[name] as string : ''
const valid = computed(() => value('client_id') === 'hephaestus' && value('code_challenge_method') === 'S256' && /^[A-Za-z0-9_-]{43}$/.test(value('code_challenge')) && /^[a-f0-9]{64}$/.test(value('state')))
async function authorize() {
  if (waiting.value || !valid.value) return
  waiting.value = true
  error.value = ''
  try {
    // Apollo validates the exact registered callback before issuing any code.
    const { data } = await axios.post('/api/v1/sso/authorize', {
      client_id: value('client_id'), redirect_uri: value('redirect_uri'), code_challenge: value('code_challenge'),
    })
    if (typeof data.code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(data.code)) throw new Error('Invalid authorization response')
    const callback = new URL(value('redirect_uri'))
    callback.searchParams.set('code', data.code)
    callback.searchParams.set('state', value('state'))
    clearAuthorization()
    window.location.replace(callback.href)
  } catch (e: any) {
    if (e.response?.status === 401) {
      useLocalStore().clear()
      await router.replace({ name: 'Login' })
    } else {
      error.value = zh.value ? '无法授权访问，请确认权限或稍后重试。' : 'Access could not be authorized. Check permissions or try again later.'
    }
  } finally { waiting.value = false }
}
function cancel() { clearAuthorization(); router.replace({ name: 'User' }) }
</script>
<template>
  <main class="authorization-page">
    <section class="authorization-card">
      <p>Apollo · Jian Unified System</p>
      <h1>{{ zh ? '访问 Hephaestus' : 'Access Hephaestus' }}</h1>
      <p>{{ zh ? '允许 Hephaestus 使用当前 Apollo 账户访问你的工作收入和相关功能。你可以在 Apollo 的账户安全设置中撤销此次授权。' : 'Allow Hephaestus to use your Apollo account for your work income and related features. You can revoke this access in Apollo account security.' }}</p>
      <p v-if="!valid" role="alert">{{ zh ? '授权请求无效，请从 Hephaestus 重新进入。' : 'Invalid authorization request. Start again from Hephaestus.' }}</p>
      <p v-if="error" role="alert">{{ error }}</p>
      <div class="authorization-actions">
        <el-button @click="cancel" :disabled="waiting">{{ zh ? '取消' : 'Cancel' }}</el-button>
        <el-button type="primary" :disabled="!valid" :loading="waiting" @click="authorize">{{ zh ? '允许并继续' : 'Allow and continue' }}</el-button>
      </div>
    </section>
  </main>
</template>
<style scoped>
.authorization-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
.authorization-card { max-width: 480px; padding: 32px; border: 1px solid var(--el-border-color); border-radius: 16px; background: var(--el-bg-color); color: var(--el-text-color-primary); line-height: 1.6; }
.authorization-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
[role=alert] { color: var(--el-color-danger); }
</style>
