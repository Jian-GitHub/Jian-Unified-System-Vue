<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

import ErrorBanner from '@/components/common/ErrorBanner.vue'

import { useInvoiceStore } from '@/store/invoice'

const { t } = useI18n()
const store = useInvoiceStore()

const profile = reactive({
  fromName: store.profile.fromName,
  fromAddress: store.profile.fromAddress,
  phone: store.profile.phone,
  defaultBillTo: store.profile.defaultBillTo,
  defaultBillToCountry: store.profile.defaultBillToCountry,
  defaultDescription: store.profile.defaultDescription,
  defaultTerms: store.profile.defaultTerms,
})

const error = ref<string | null>(null)
const saving = ref(false)

watch(profile, () => undefined, { deep: true })

function save() {
  saving.value = true
  error.value = null
  try {
    store.saveProfile({ ...profile })
    ElMessage.success(t('invoice.saved.draftSaved'))
  } catch (e: any) {
    error.value = e?.message ?? t('ui.requestFailed')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="invoice-issuer-page">

    <main class="content">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('invoice.title') }}</p>
          <h1>{{ t('invoice.form.parties') }}</h1>
          <p class="subtitle">{{ t('ui.issuerNote') }}</p>
        </div>
        <el-button type="primary" :loading="saving" @click="save">{{ t('app.save') }}</el-button>
      </header>

      <ErrorBanner :message="error" />

      <section class="heph-card">
        <div class="grid">
          <label>
            <span>{{ t('invoice.form.fromName') }}</span>
            <el-input v-model="profile.fromName" />
          </label>
          <label>
            <span>{{ t('invoice.form.phone') }}</span>
            <el-input v-model="profile.phone" />
          </label>
          <label>
            <span>{{ t('invoice.form.billTo') }}</span>
            <el-input v-model="profile.defaultBillTo" />
          </label>
          <label>
            <span>{{ t('invoice.form.billToCountry') }}</span>
            <el-input v-model="profile.defaultBillToCountry" />
          </label>
          <label class="wide">
            <span>{{ t('invoice.form.fromAddress') }}</span>
            <el-input v-model="profile.fromAddress" type="textarea" :rows="3" />
          </label>
          <label class="wide">
            <span>{{ t('invoice.form.description') }}</span>
            <el-input v-model="profile.defaultDescription" type="textarea" :rows="2" />
          </label>
          <label class="wide">
            <span>{{ t('invoice.form.terms') }}</span>
            <el-input v-model="profile.defaultTerms" type="textarea" :rows="3" />
          </label>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.invoice-issuer-page {
  min-height: 100vh;
  background: var(--heph-canvas);
}
.content {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}
.page-header h1 {
  margin: 4px 0 6px;
  font-size: 1.6rem;
  color: var(--heph-pine);
}
.page-header .subtitle {
  margin: 0;
  color: var(--heph-muted);
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.grid label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--heph-muted);
}
.grid label.wide {
  grid-column: span 2;
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .grid label.wide {
    grid-column: span 1;
  }
}
</style>
