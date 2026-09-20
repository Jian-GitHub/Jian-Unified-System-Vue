<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLocalStore, useSessionStore } from '@/store'
import type { Contact } from '@/types/User'
import {
  AddContact,
  ChangeNotificationEmail,
  ChangePassword,
  DeleteAccount,
  RemoveContact,
  RemoveNotificationEmail,
} from '@/api/AccountActions'
import { apiErrorKey } from '@/api/errors'
import EmailIcon from '@/assets/icon/email_20x20.svg'
import PhoneIcon from '@/assets/icon/phone_20x20.svg'
import AddIcon from '@/assets/icon/plus_20x20.svg'
import RemoveIcon from '@/assets/icon/remove_20x20.svg'
import AccountField from './AccountField.vue'

const props = defineProps<{ actionId: number }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const store = useSessionStore()
const localStore = useLocalStore()
const router = useRouter()
const contacts = computed(() => store.user?.security.contacts || [])
const contactGroups = computed(() => [
  { key: 'email', icon: EmailIcon, items: contacts.value.filter(item => item.type === 1) },
  { key: 'phone', icon: PhoneIcon, items: contacts.value.filter(item => item.type === 2) },
])
const editor = ref<'email' | 'phone' | ''>('')
const contactValue = ref('')
const removeContact = ref<Contact | null>(null)
const notificationMode = ref<'view' | 'edit' | 'remove'>('view')
const notificationEmail = ref(store.user?.security.notificationEmail || '')
const password = reactive({ current: '', next: '', confirm: '', signOut: false })
const recoveryEmail = ref('')
const deleteConfirmation = ref('')
const deletePassword = ref('')
const acknowledged = ref(false)
const feedback = ref('')
const busy = ref(false)
const passwordFocused = ref(false)
const requirements = computed(() => [
  { key: 'password_length', met: password.next.length >= 8 && new TextEncoder().encode(password.next).length <= 72 },
  { key: 'password_digit', met: /\d/.test(password.next) },
  { key: 'password_upper', met: /[A-Z]/.test(password.next) },
  { key: 'password_lower', met: /[a-z]/.test(password.next) },
  { key: 'password_special', met: /[^A-Za-z0-9\s]/.test(password.next) },
])
const strength = computed(() => requirements.value.filter(item => item.met).length * 20)
const updatedDate = computed(() => {
  const date = store.user?.security.passwordUpdatedDate
  return date?.year && date.month && date.day ? t('account_ui.updated_date', date) : t('account_ui.updated_unknown')
})

function startContact(kind: 'email' | 'phone') {
  editor.value = kind
  contactValue.value = ''
  removeContact.value = null
  feedback.value = ''
}
async function saveContact() {
  const value = contactValue.value.trim()
  const digits = value.replace(/\D/g, '')
  if (editor.value === 'phone' && (!/^\+?[\d\s()-]+$/.test(value) || digits.length < 6 || digits.length > 15)) { feedback.value = 'invalid_phone'; return }
  if (contacts.value.some(item => item.value.toLowerCase() === value.toLowerCase())) { feedback.value = 'duplicate_contact'; return }
  busy.value = true
  feedback.value = ''
  try {
    const type = editor.value === 'email' ? 1 : 2
    const response = await AddContact(value, type, type === 2 ? (store.user?.info.locale || 'CN') : '')
    store.user?.security.contacts.push(response.data.data.contact)
    editor.value = ''
    contactValue.value = ''
    feedback.value = 'contact_added'
  } catch (error) {
    feedback.value = apiErrorKey(error)
  } finally {
    busy.value = false
  }
}

async function removeSelectedContact() {
  if (!removeContact.value || removeContact.value.primary) return
  busy.value = true
  feedback.value = ''
  try {
    await RemoveContact(removeContact.value.id)
    if (store.user) store.user.security.contacts = contacts.value.filter(item => item.id !== removeContact.value?.id)
    removeContact.value = null
    feedback.value = 'contact_removed'
  } catch (error) {
    feedback.value = apiErrorKey(error)
  } finally {
    busy.value = false
  }
}

async function savePassword() {
  if (!requirements.value.every(item => item.met)) { feedback.value = 'invalid_password'; return }
  if (password.next !== password.confirm) { feedback.value = 'password_mismatch'; return }
  if (password.current === password.next) { feedback.value = 'password_same'; return }
  busy.value = true
  feedback.value = ''
  try {
    await ChangePassword(password.current, password.next, password.confirm, password.signOut)
    const now = new Date()
    if (store.user) store.user.security.passwordUpdatedDate = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()}
    password.current = ''
    password.next = ''
    password.confirm = ''
    if (password.signOut) {
      ElMessage.success(t('account_ui.password_saved_signout'))
      localStore.clear()
      store.clear()
      await router.replace({name: 'Login'})
      return
    }
    emit('close')
  } catch (error) {
    feedback.value = apiErrorKey(error)
  } finally {
    busy.value = false
  }
}

async function saveNotificationEmail() {
  busy.value = true
  feedback.value = ''
  try {
    const email = notificationEmail.value.trim()
    await ChangeNotificationEmail(email)
    if (store.user) store.user.security.notificationEmail = email
    notificationMode.value = 'view'
    feedback.value = 'notification_saved'
  } catch (error) {
    feedback.value = apiErrorKey(error)
  } finally {
    busy.value = false
  }
}

async function removeNotification() {
  busy.value = true
  feedback.value = ''
  try {
    await RemoveNotificationEmail()
    if (store.user) store.user.security.notificationEmail = ''
    notificationEmail.value = ''
    notificationMode.value = 'view'
    feedback.value = 'notification_removed'
  } catch (error) {
    feedback.value = apiErrorKey(error)
  } finally {
    busy.value = false
  }
}

async function deleteAccount() {
  busy.value = true
  feedback.value = ''
  try {
    await DeleteAccount(deleteConfirmation.value, deletePassword.value)
    ElMessage.success(t('account_ui.account_deleted'))
    localStore.clear()
    store.clear()
    await router.replace({name: 'Login'})
  } catch (error) {
    feedback.value = apiErrorKey(error)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="account-editor-content security-fields" @input="feedback = ''">
    <template v-if="actionId === 200">
      <p class="contact-count">{{ t('account_ui.contact_count', { count: contacts.length }) }}</p>
      <p class="account-description">{{ t('account_ui.contacts_description') }}</p>
      <section v-for="group in contactGroups" :key="group.key" class="contact-group" :aria-label="t('account_ui.' + group.key)">
        <header class="contact-group-heading">
          <h3>{{ t('account_ui.' + group.key) }}</h3>
          <button type="button" class="account-icon-button" :aria-label="t('account_ui.add_' + group.key)" @click="startContact(group.key as 'email' | 'phone')"><AddIcon aria-hidden="true" /></button>
        </header>
        <p v-if="!group.items.length" class="empty-state">{{ t('account_ui.no_' + group.key) }}</p>
        <ul v-else class="contact-list">
          <li v-for="contact in group.items" :key="contact.id">
            <component :is="group.icon" class="contact-icon" aria-hidden="true" />
            <span class="contact-value">{{ contact.value }}</span>
            <span v-if="contact.primary" class="primary-contact">{{ t('account_ui.primary_contact') }}</span>
            <button v-else type="button" class="account-icon-button" :aria-label="t('account_ui.remove_contact', { value: contact.value })" @click="removeContact = contact; editor = ''; feedback = ''"><RemoveIcon aria-hidden="true" /></button>
          </li>
        </ul>
      </section>
      <form v-if="editor" class="account-note contact-editor" @submit.prevent="saveContact">
        <h3>{{ t('account_ui.add_' + editor) }}</h3>
        <AccountField v-model="contactValue" :label="t('account_ui.' + editor)" :type="editor === 'email' ? 'email' : 'tel'" :autocomplete="editor === 'email' ? 'email' : 'tel'" required />
        <div class="account-editor-actions">
          <button type="button" class="account-button" @click="editor = ''; feedback = ''">{{ t('account_ui.cancel') }}</button>
          <button type="submit" class="account-button primary" :disabled="busy">{{ t(busy ? 'account_ui.saving' : 'account_ui.add') }}</button>
        </div>
      </form>
      <aside v-if="removeContact" class="account-note contact-editor">
        <h3>{{ t('account_ui.remove_title') }}</h3>
        <p>{{ t('account_ui.remove_contact_description', { value: removeContact.value }) }}</p>
        <div class="account-editor-actions">
          <button type="button" class="account-button" @click="removeContact = null; feedback = ''">{{ t('account_ui.cancel') }}</button>
          <button type="button" class="account-button danger" :disabled="busy" @click="removeSelectedContact">{{ t(busy ? 'account_ui.saving' : 'account_ui.confirm_remove') }}</button>
        </div>
      </aside>
    </template>

    <template v-else-if="actionId === 201">
      <p class="account-description updated-date">{{ updatedDate }}</p>
      <h3 class="section-title">{{ t('account_ui.change_password') }}</h3>
      <form id="account-password-form" @submit.prevent="savePassword">
        <div class="password-layout">
          <div class="account-field-stack password-fields">
            <AccountField v-model="password.current" :label="t('account_ui.current_password')" type="password" autocomplete="current-password" required />
            <div @focusin="passwordFocused = true" @focusout="passwordFocused = false">
              <AccountField v-model="password.next" :label="t('account_ui.new_password')" type="password" autocomplete="new-password" required />
            </div>
            <AccountField v-model="password.confirm" :label="t('account_ui.confirm_password')" type="password" autocomplete="new-password" required />
          </div>
          <aside v-if="passwordFocused || password.next" class="password-checker" aria-live="polite">
            <p>{{ t('account_ui.password_strength', { value: strength }) }}</p>
            <progress :value="strength" max="100" :aria-label="t('account_ui.password_requirements')" />
            <h4>{{ t('account_ui.password_requirements') }}</h4>
            <ul><li v-for="item in requirements" :key="item.key" :class="{ met: item.met }"><span aria-hidden="true">{{ item.met ? '✓' : '○' }}</span><span>{{ t('account_ui.' + item.key) }}</span><span class="visually-hidden">{{ t(item.met ? 'account_ui.met' : 'account_ui.unmet') }}</span></li></ul>
          </aside>
        </div>
        <label class="account-checkbox"><input v-model="password.signOut" type="checkbox" /><span>{{ t('account_ui.sign_out_devices') }}</span></label>
      </form>
    </template>

    <template v-else-if="actionId === 203">
      <p class="account-description">{{ t('account_ui.notification_description') }}</p>
      <section class="notification-content">
        <h3 class="section-title">{{ t('account_ui.notification_current') }}</h3>
        <p class="notification-value">{{ store.user?.security.notificationEmail || t('account_ui.no_email') }}</p>
        <div v-if="notificationMode === 'view'" class="notification-buttons">
          <button type="button" class="account-button" @click="notificationMode = 'edit'; feedback = ''">{{ t('account_ui.change_email') }}</button>
          <button v-if="store.user?.security.notificationEmail" type="button" class="account-button" @click="notificationMode = 'remove'; feedback = ''">{{ t('account_ui.remove_email') }}</button>
        </div>
        <form v-else-if="notificationMode === 'edit'" @submit.prevent="saveNotificationEmail">
          <AccountField v-model="notificationEmail" :label="t('account_ui.email')" type="email" autocomplete="email" required />
          <div class="account-editor-actions"><button type="button" class="account-button" @click="notificationMode = 'view'; feedback = ''">{{ t('account_ui.cancel') }}</button><button type="submit" class="account-button primary" :disabled="busy">{{ t(busy ? 'account_ui.saving' : 'account_ui.save_changes') }}</button></div>
        </form>
        <aside v-else class="account-note">
          <h3>{{ t('account_ui.remove_title') }}</h3>
          <p>{{ t('account_ui.notification_remove_description') }}</p>
          <div class="account-editor-actions"><button type="button" class="account-button" @click="notificationMode = 'view'; feedback = ''">{{ t('account_ui.cancel') }}</button><button type="button" class="account-button danger" :disabled="busy" @click="removeNotification">{{ t(busy ? 'account_ui.saving' : 'account_ui.confirm_remove') }}</button></div>
        </aside>
        <p class="account-description notification-hint">{{ t('account_ui.notification_hint') }}</p>
      </section>
    </template>

    <form v-else-if="actionId === 206" id="account-delete-form" @submit.prevent="deleteAccount">
      <aside class="account-note deletion-note"><h3>{{ t('account_ui.delete_heading') }}</h3><p>{{ t('account_ui.delete_description') }}</p></aside>
      <label class="account-checkbox"><input v-model="acknowledged" type="checkbox" required /><span>{{ t('account_ui.delete_acknowledgement') }}</span></label>
      <AccountField v-model="deletePassword" :label="t('account_ui.current_password_optional')" type="password" autocomplete="current-password" />
      <AccountField v-model="deleteConfirmation" :label="t('account_ui.delete_input')" required />
    </form>

    <form v-else-if="actionId === 207" id="account-recovery-form" @submit.prevent="feedback = 'recovery_unavailable'">
      <p class="account-description recovery-description">{{ t('account_ui.recovery_description') }}</p>
      <AccountField v-model="recoveryEmail" :label="t('account_ui.email')" type="email" autocomplete="email" required />
    </form>

    <p class="account-availability">{{ t(actionId === 207 ? 'account_ui.recovery_notice' : 'account_ui.save_notice') }}</p>
    <p v-if="feedback" class="account-feedback" :class="{ error: !['contact_added', 'contact_removed', 'password_saved', 'notification_saved', 'notification_removed'].includes(feedback) }" role="status">{{ t('account_ui.' + feedback) }}</p>
    <footer class="account-editor-actions">
      <button type="button" class="account-button" @click="emit('close')">{{ t(actionId === 207 ? 'account_ui.back_login' : 'account_ui.close') }}</button>
      <button v-if="actionId === 201" type="submit" form="account-password-form" class="account-button primary" :disabled="busy">{{ t(busy ? 'account_ui.saving' : 'account_ui.save_changes') }}</button>
      <button v-if="actionId === 206" type="submit" form="account-delete-form" class="account-button danger" :disabled="busy || !acknowledged || deleteConfirmation !== 'DELETE'">{{ t(busy ? 'account_ui.saving' : 'account_ui.delete_account') }}</button>
      <button v-if="actionId === 207" type="submit" form="account-recovery-form" class="account-button primary">{{ t('account_ui.continue') }}</button>
    </footer>
  </div>
</template>

<style scoped>
.contact-count { text-align: center; margin: -2rem 0 .75rem; }
.contact-group { margin-top: 1.5rem; }
.contact-group-heading { display: flex; align-items: center; justify-content: space-between; }
.contact-group-heading h3 { font-size: 1.125rem; font-weight: 600; }
.contact-list { list-style: none; padding: 0; max-height: 12rem; overflow-y: auto; }
.contact-list li { display: flex; gap: .875rem; align-items: center; min-height: 2.5rem; }
.contact-icon { width: 1.25rem; height: 1.25rem; color: var(--jus-color-global-icon-blue); flex-shrink: 0; }
.contact-value { flex: 1; overflow-wrap: anywhere; min-width: 0; }
.primary-contact { color: var(--jus-color-global-neutrals-text-secondary); font-size: .75rem; }
.empty-state { font-size: .875rem; color: var(--jus-color-global-neutrals-text-secondary); padding-block: .5rem; }
.contact-editor { margin-top: 1rem; overflow-wrap: anywhere; }
.updated-date { margin: -2rem 0 3rem; }
.section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.25rem; }
.password-layout { display: grid; grid-template-columns: 17.5rem 17rem; gap: 1rem; align-items: start; }
.password-fields { max-width: 17.5rem; }
.password-checker { margin-top: 4.4rem; padding: 1rem; border: 1px solid var(--jus-color-global-neutrals-text-placeholder); border-radius: .75rem; background: var(--jus-color-doraemon-surface); box-shadow: 0 4px 16px #0002; font-size: .875rem; }
.password-checker progress { display: block; width: 100%; height: .375rem; margin-block: .75rem; accent-color: var(--jus-color-global-icon-blue); }
.password-checker ul { padding: 0; list-style: none; margin-top: .5rem; }
.password-checker li { display: flex; gap: .5rem; color: var(--jus-color-global-neutrals-text-secondary); line-height: 1.75; }
.password-checker li.met { color: var(--jus-color-global-icon-blue); }
.account-checkbox { display: flex; gap: .75rem; align-items: flex-start; margin-block: 1.5rem; cursor: pointer; }
.account-checkbox input { width: 1rem; height: 1rem; margin-top: .25rem; flex-shrink: 0; accent-color: var(--jus-color-global-icon-blue); }
.notification-content { max-width: 28.125rem; margin: 2.5rem auto 0; }
.notification-content .section-title { margin-bottom: .25rem; }
.notification-value { margin-bottom: 2rem; overflow-wrap: anywhere; }
.notification-buttons { display: flex; flex-direction: column; align-items: flex-start; gap: 2rem; }
.notification-hint { margin-top: 1.5rem; text-align: left; }
.deletion-note { border-color: var(--jus-color-global-functional-error); }
.deletion-note + .account-checkbox + .account-field { margin-bottom: .875rem; }
.recovery-description { margin-bottom: 2rem; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 900px) { .password-layout { grid-template-columns: 1fr; } .password-fields { max-width: none; } .password-checker { margin-top: 0; } }
</style>
