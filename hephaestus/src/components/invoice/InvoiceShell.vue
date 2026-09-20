<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'

import { useSessionStore } from '@/store/session'


const { t } = useI18n()
const router = useRouter()
const session = useSessionStore()
</script>

<template>
  <header class="invoice-shell">
    <router-link class="brand" :to="{ name: 'invoice' }">
      <el-icon class="heph-mark"><Document /></el-icon>
      <div>
        <p class="title">{{ t('invoice.title') }}</p>
        <p class="badge">{{ session.isAuthenticated ? (session.displayName || 'Apollo') : t('invoice.publicBadge') }}</p>
      </div>
    </router-link>

    <nav class="actions">
      <el-button v-if="session.isAuthenticated" text @click="router.push({ name: 'invoice-issuer' })">{{ t('invoice.form.parties') }}</el-button>
      <el-button v-if="session.isAuthenticated" text @click="router.push({ name: 'invoice-saved' })">{{ t('invoice.list.heading') }}</el-button>
      <el-button text @click="router.push({ name: 'dashboard' })">{{ t('invoice.goIncome') }}</el-button>

    </nav>
  </header>
  <slot />
</template>

<style scoped>
.invoice-shell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  gap: 16px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--heph-rule);
  background: var(--heph-canvas);
  position: relative;
  top: 0;
  z-index: 10;
}
.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.heph-mark {
  font-size: 1.4rem;
  color: var(--heph-pine);
}
.title {
  margin: 0;
  font-weight: 600;
  color: var(--heph-pine);
  font-size: 0.95rem;
}
.badge {
  margin: 0;
  font-size: 0.7rem;
  color: var(--heph-muted);
  letter-spacing: 0.04em;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
