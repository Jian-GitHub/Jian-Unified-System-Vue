<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseIcon from '@/assets/icon/close_bold_20x20.svg'
import UserIcon from '@/assets/icon/user_20x20.svg'
import DateIcon from '@/assets/icon/date_20x20.svg'
import EarthIcon from '@/assets/icon/earth_20x20.svg'
import LanguageIcon from '@/assets/icon/language_20x20.svg'
import PhoneIcon from '@/assets/icon/phone_20x20.svg'
import PasswordIcon from '@/assets/icon/password_input_20x20.svg'
import EmailIcon from '@/assets/icon/email_20x20.svg'
import DeleteIcon from '@/assets/icon/delete_account.svg'
import ProfileFields from './ProfileFields.vue'
import SecurityFields from './SecurityFields.vue'
import en from 'element-plus/es/locale/lang/en'
import zh from 'element-plus/es/locale/lang/zh-cn'
import ja from 'element-plus/es/locale/lang/ja'
import ko from 'element-plus/es/locale/lang/ko'

const props = defineProps<{ modelValue: boolean; actionId: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { t, locale } = useI18n()
const elementLocale = computed(() => ({ en, zh, ja, ko })[locale.value] || en)
const views = {
  100: { title: 'info_page.actions.name.title', icon: UserIcon },
  101: { title: 'info_page.actions.birthday.title', icon: DateIcon },
  102: { title: 'info_page.actions.country_region.title', icon: EarthIcon },
  103: { title: 'info_page.actions.language.title', icon: LanguageIcon },
  200: { title: 'security_page.actions.email_mobile.title', icon: PhoneIcon },
  201: { title: 'security_page.actions.password.title', icon: PasswordIcon },
  203: { title: 'security_page.actions.notification_email.title', icon: EmailIcon },
  206: { title: 'security_page.actions.delete_account.title', icon: DeleteIcon },
  207: { title: 'account_ui.recovery_title', icon: PasswordIcon },
}
const view = computed(() => views[props.actionId as keyof typeof views])
const close = () => emit('update:modelValue', false)
</script>

<template>
  <el-config-provider :locale="elementLocale">
  <el-dialog v-if="view" :model-value="modelValue" :title="t(view.title)"
             class="account-editor-dialog" :class="{ 'account-editor-danger': actionId === 206 }"
             :close-icon="CloseIcon" :close-on-click-modal="false" append-to-body destroy-on-close
             top="8.75vh" @update:model-value="emit('update:modelValue', $event)">
    <template #header="{ titleId, titleClass }">
      <div class="account-editor-heading">
        <component :is="view.icon" class="account-editor-icon" aria-hidden="true" />
        <h2 :id="titleId" :class="titleClass">{{ t(view.title) }}</h2>
      </div>
    </template>
    <ProfileFields v-if="actionId < 200" :key="actionId" :action-id="actionId" @close="close" />
    <SecurityFields v-else :key="actionId" :action-id="actionId" @close="close" />
  </el-dialog>
  </el-config-provider>
</template>

<style>
.el-dialog.account-editor-dialog { --el-dialog-bg-color: var(--jus-color-icarus-surface); --el-text-color-primary: var(--jus-color-global-neutrals-text-primary); width: 43.125rem; max-width: calc(100vw - 2rem); min-height: 31.375rem; padding: 4.25rem 5rem 2rem; border-radius: .75rem; box-shadow: 0 4px 8px 4px #00000040; color: var(--jus-color-global-neutrals-text-primary); }
.account-editor-dialog .el-dialog__header { padding: 0; margin: 0 0 2.75rem; }
.account-editor-dialog .el-dialog__body { padding: 0; color: inherit; }
.account-editor-dialog .el-dialog__headerbtn { left: .75rem; right: auto; top: .75rem; color: var(--jus-color-global-neutrals-text-secondary); }
.account-editor-heading { display: flex; flex-direction: column; align-items: center; gap: .75rem; text-align: center; }
.account-editor-icon { width: 3.25rem; height: 3.25rem; color: var(--jus-color-global-icon-blue); }
.account-editor-heading h2 { font-size: 1.5rem; font-weight: 600; line-height: 2rem; color: inherit; }
.account-editor-danger .account-editor-icon { color: var(--jus-color-global-functional-error); }
.account-editor-content { font-size: 1rem; line-height: 1.5; }
.account-field-stack { display: grid; gap: .875rem; }
.account-description { text-align: center; font-size: .875rem; line-height: 1.5; overflow-wrap: anywhere; }
.account-select { display: flex; flex-direction: column; padding: .4rem 1rem; border: 1px solid var(--jus-color-global-neutrals-text-placeholder); border-radius: .75rem; background: var(--jus-color-icarus-surface); }
.account-select span { font-size: .75rem; color: var(--jus-color-global-neutrals-text-secondary); }
.account-select select { border: 0; background: var(--jus-color-icarus-surface); color: var(--jus-color-global-neutrals-text-primary); font: inherit; width: 100%; min-height: 1.875rem; }
.account-select:focus-within { outline: 2px solid var(--jus-color-global-icon-blue); outline-offset: 2px; }
.account-select select:focus { outline: 0; }
.account-note { border: 1px solid var(--jus-color-global-neutrals-text-placeholder); border-radius: .75rem; padding: 1rem 1.25rem; background: var(--jus-color-doraemon-surface); }
.account-note h3 { font-size: 1.0625rem; font-weight: 600; margin-bottom: .5rem; }
.account-note p { font-size: .875rem; color: var(--jus-color-global-neutrals-text-secondary); }
.account-availability { color: var(--jus-color-global-neutrals-text-secondary); font-size: .8125rem; margin-top: 1.5rem; }
.account-feedback { margin-top: 1rem; color: var(--jus-color-global-icon-blue); font-size: .875rem; }
.account-feedback.error { color: var(--jus-color-global-functional-error); }
.account-editor-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: .75rem; margin-top: 1.5rem; }
.account-button { cursor: pointer; border: 1px solid var(--jus-color-global-icon-blue); color: var(--jus-color-global-icon-blue); background: transparent; border-radius: .5rem; padding: .45rem 1rem; font: inherit; font-size: .875rem; min-height: 2.25rem; }
.account-button.primary { background: var(--jus-color-global-icon-blue); color: white; }
.account-button.danger { border-color: var(--jus-color-global-functional-error); color: var(--jus-color-global-functional-error); }
.account-button:hover { filter: brightness(.9); }
.account-button:disabled { opacity: .45; cursor: not-allowed; }
.account-button:focus-visible, .account-icon-button:focus-visible { outline: 2px solid var(--jus-color-global-icon-blue); outline-offset: 3px; }
.account-icon-button { border: 0; background: transparent; color: inherit; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: .5rem; border-radius: .5rem; }
.account-icon-button svg { width: 1.25rem; height: 1.25rem; }
.account-icon-button:hover { background: var(--jus-color-doraemon-primary-200); }
@media (max-width: 700px) { .el-dialog.account-editor-dialog { padding: 3.5rem 1.5rem 1.5rem; } }
</style>
