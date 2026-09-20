<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/store'
import AccountField from './AccountField.vue'
import { UpdateBirthday, UpdateLanguage, UpdateName } from '@/api/AccountActions'
import { apiErrorKey } from '@/api/errors'

const props = defineProps<{ actionId: number }>()
const emit = defineEmits<{ close: [] }>()
const { t, locale } = useI18n()
const store = useSessionStore()
const info = store.user?.info
const name = reactive({ familyName: info?.name?.familyName || '', middleName: info?.name?.middleName || '', givenName: info?.name?.givenName || '' })
const birthday = reactive({ year: info?.birthday?.year || '', month: info?.birthday?.month || '', day: info?.birthday?.day || '' })
const language = ref(info?.language || '')
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 121 }, (_, i) => currentYear - i)
const days = computed(() => birthday.year && birthday.month ? new Date(Number(birthday.year), Number(birthday.month), 0).getDate() : 31)
watch(days, limit => { if (Number(birthday.day) > limit) birthday.day = '' })
const validBirthday = computed(() => {
  if (!birthday.year || !birthday.month || !birthday.day) return false
  return new Date(Number(birthday.year), Number(birthday.month) - 1, Number(birthday.day)) <= new Date()
})
const feedback = ref('')
const saving = ref(false)
const region = computed(() => info?.locale ? t('country_region.' + info.locale) : t('account_ui.empty'))
async function save() {
  if (props.actionId === 101 && !validBirthday.value) { feedback.value = 'invalid_date'; return }
  if (props.actionId === 100 && (!name.familyName.trim() || !name.givenName.trim())) { feedback.value = 'required'; return }
  saving.value = true
  feedback.value = ''
  try {
    if (props.actionId === 100) {
      await UpdateName(name.givenName.trim(), name.middleName.trim(), name.familyName.trim())
      if (store.user) store.user.info.name = {
        givenName: name.givenName.trim(),
        middleName: name.middleName.trim(),
        familyName: name.familyName.trim(),
      }
    } else if (props.actionId === 101) {
      const value = {year: Number(birthday.year), month: Number(birthday.month), day: Number(birthday.day)}
      await UpdateBirthday(value.year, value.month, value.day)
      if (store.user) store.user.info.birthday = value
    } else if (props.actionId === 103) {
      await UpdateLanguage(language.value)
      if (store.user) store.user.info.language = language.value
      store.language = language.value
      locale.value = language.value
    }
    emit('close')
  } catch (error) {
    feedback.value = apiErrorKey(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="account-editor-content profile-fields" @submit.prevent="save" @input="feedback = ''" @change="feedback = ''">
    <div v-if="actionId === 100" class="account-field-stack">
      <AccountField v-model="name.familyName" :label="t('account_ui.family_name')" autocomplete="family-name" required />
      <AccountField v-model="name.middleName" :label="t('account_ui.middle_name')" autocomplete="additional-name" />
      <AccountField v-model="name.givenName" :label="t('account_ui.given_name')" autocomplete="given-name" required />
    </div>

    <template v-else-if="actionId === 101">
      <p class="account-description">{{ t('account_ui.birthday_description') }}</p>
      <div class="birthday-fields">
        <label class="account-select"><span>{{ t('account_ui.year') }}</span><select v-model="birthday.year" required><option disabled value="">—</option><option v-for="year in years" :key="year" :value="year">{{ year }}</option></select></label>
        <label class="account-select"><span>{{ t('account_ui.month') }}</span><select v-model="birthday.month" required><option disabled value="">—</option><option v-for="month in 12" :key="month" :value="month">{{ month }}</option></select></label>
        <label class="account-select"><span>{{ t('account_ui.day') }}</span><select v-model="birthday.day" required><option disabled value="">—</option><option v-for="day in days" :key="day" :value="day">{{ day }}</option></select></label>
      </div>
    </template>

    <template v-else-if="actionId === 102">
      <p class="account-region">{{ region }}</p>
      <p class="account-description">{{ t('account_ui.region_description') }}</p>
      <aside class="account-note">
        <h3>{{ t('account_ui.region_help_title') }}</h3>
        <p>{{ t('account_ui.region_help') }}</p>
      </aside>
    </template>

    <label v-else-if="actionId === 103" class="account-select language-field">
      <span>{{ t('info_page.actions.language.title') }}</span>
      <select v-model="language" required>
        <option disabled value="">{{ t('account_ui.select_language') }}</option>
        <option v-for="lang in store.languages" :key="lang" :value="lang">{{ t('languages.' + lang + '.original') }} — {{ t('languages.' + lang + '.text') }}</option>
      </select>
    </label>

    <p v-if="actionId !== 102" class="account-availability">{{ t('account_ui.save_notice') }}</p>
    <p v-if="feedback" class="account-feedback" :class="{ error: feedback !== 'saved' }" role="status">{{ t('account_ui.' + feedback) }}</p>
    <footer class="account-editor-actions">
      <button type="button" class="account-button" @click="emit('close')">{{ t('account_ui.close') }}</button>
      <button v-if="actionId !== 102" type="submit" class="account-button primary" :disabled="saving">{{ t(saving ? 'account_ui.saving' : 'account_ui.save_changes') }}</button>
    </footer>
  </form>
</template>

<style scoped>
.profile-fields { max-width: 28.125rem; margin-inline: auto; }
.birthday-fields { display: grid; grid-template-columns: 1.15fr 1fr 1fr; gap: .625rem; margin-top: 2.5rem; }
.language-field { margin-top: 2.5rem; }
.account-region { font-size: 1.0625rem; font-weight: 600; text-align: center; margin-bottom: 1.5rem; }
.account-note { margin-top: 2rem; }
</style>
