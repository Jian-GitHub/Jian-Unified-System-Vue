<script setup lang="ts">
import PasskeyIcon from "@/assets/icon/passkey_20x20.svg";
import AddIcon from "@/assets/icon/plus_20x20.svg";
import DeleteIcon from "@/assets/icon/remove_20x20.svg";
import {computed, ComputedRef, nextTick, onMounted, ref, Ref} from "vue";
import {useI18n} from "vue-i18n";
import {useSessionStore} from "@/store";
import InputShort from "@/components/Input/InputShort.vue";
import {GetTenPasskeys, Passkey, PasskeyBindFinish, PasskeyBindStart, RemovePasskey} from "@/api/AccountActions";
import {apiErrorKey} from '@/api/errors'
import {parseCreationOptions, serializeRegistrationCredential} from '@/utils/webauthn'

const {t} = useI18n()
const store = useSessionStore()

const contentHeaderText = computed(() => t('user_action_dialog.passkeys.content.header', {num: store.user.security.passkeysNum}))

const createdDateText = (passkey: Passkey) => computed(() => t('user_action_dialog.passkeys.content.row.date', {
  year: passkey.date.year,
  month: passkey.date.month,
  day: passkey.date.day
}))

// const passkeys: PasskeysDialogRowData[] = [
//   {
//     displayName: "Chaos", date: {
//       year: 2023,
//       month: 11,
//       day: 1
//     }
//   },
//   {
//     displayName: "Apollo", date: {
//       year: 2024,
//       month: 12,
//       day: 3
//     }
//   },
//   {
//     displayName: "Apollo", date: {
//       year: 2024,
//       month: 12,
//       day: 3
//     }
//   },
//   {
//     displayName: "Apollo", date: {
//       year: 2024,
//       month: 12,
//       day: 3
//     }
//   },
//   {
//     displayName: "Apollo", date: {
//       year: 2024,
//       month: 12,
//       day: 3
//     }
//   },
//   {
//     displayName: "Apollo", date: {
//       year: 2024,
//       month: 12,
//       day: 3
//     }
//   },
//   {
//     displayName: "Apollo", date: {
//       year: 2024,
//       month: 12,
//       day: 3
//     }
//   },
//   {
//     displayName: "Apollo", date: {
//       year: 2024,
//       month: 12,
//       day: 3
//     }
//   },
//   {
//     displayName: "Apollo", date: {
//       year: 2024,
//       month: 12,
//       day: 3
//     }
//   },
//   {
//     displayName: "Argus Created at 2025-09-12 12:55:04", date: {
//       year: 2024,
//       month: 5,
//       day: 22
//     }
//   }
// ]
const page: Ref<number> = ref(1);
const passkeys: Ref<Passkey[]> = ref([])
const innerVisible = ref(false)
const loadError = ref(false)
const feedback = ref('')
const pendingRemoval = ref<Passkey | null>(null)
const passkeyName = ref('')
const titleText = computed(() => t('account_ui.passkey_create'))
const inputPlaceholderText = computed(() => t('account_ui.passkey_name'))
const cancelText = computed(() => t('account_ui.cancel'))
const submitGeneratePasskeyButton = ref(null)
function passkeyDialogOpened() {
  nextTick(() => {
    submitGeneratePasskeyButton.value?.$el?.focus()
  })
}
function closePasskeyAliasDialog() {
  innerVisible.value = false;
  passkeyName.value = '';
}
async function submitGeneratePasskey() {
  innerVisible.value = false;
  store.userActionDialogLoading = true
  feedback.value = ''
  try {
    await doGeneratePasskey()
  } catch (error) {
    feedback.value = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'passkey_cancelled'
        : apiErrorKey(error)
  }
  store.userActionDialogLoading = false;
  passkeyName.value = '';
}
async function doGeneratePasskey() {
  if (!window.PublicKeyCredential) {
    feedback.value = 'passkey_unsupported'
    return
  }
  const start = await PasskeyBindStart(passkeyName.value.trim())
  const credential = await navigator.credentials.create({
    publicKey: parseCreationOptions(start.data.data.options_json),
  }) as PublicKeyCredential | null
  if (!credential) throw new DOMException('Credential creation was cancelled', 'NotAllowedError')
  const finish = await PasskeyBindFinish(
      start.data.data.session_id,
      serializeRegistrationCredential(credential),
      passkeyName.value.trim(),
  )
  passkeys.value.unshift({...finish.data.data, isEnabled: true})
  if (store.user) store.user.security.passkeysNum = passkeys.value.length
  feedback.value = 'passkey_added'
}
const queryPasskeys = async () => {
  const response = await GetTenPasskeys(page.value);
  if (response.status != 200 || response.data.code != 200) {
    loadError.value = true
    console.log('error', response.data.message);
    return;
  }
  passkeys.value = []
  response.data.data.passkeys.forEach((passkey) => {
    passkeys.value.push(passkey);
  })
  if (store.user) store.user.security.passkeysNum = response.data.data.passkeys.length;
}
async function removeSelectedPasskey() {
  if (!pendingRemoval.value) return
  store.userActionDialogLoading = true
  feedback.value = ''
  try {
    const id = pendingRemoval.value.id
    await RemovePasskey(id)
    passkeys.value = passkeys.value.filter(item => item.id !== id)
    if (store.user) store.user.security.passkeysNum = passkeys.value.length
    pendingRemoval.value = null
    feedback.value = 'passkey_removed'
  } catch (error) {
    feedback.value = apiErrorKey(error)
  } finally {
    store.userActionDialogLoading = false
  }
}
const loadPasskeys = async () => {
  loadError.value = false
  store.userActionDialogLoading = true
  try {
    await queryPasskeys()
  } catch (e) {
    loadError.value = true
    console.log(e.message)
  }
  store.userActionDialogLoading = false

  // setTimeout(() => {
  //   store.userActionDialogLoading = false
  // }, 1250)
}
onMounted(loadPasskeys)
</script>

<template>
  <el-dialog :model-value="!!pendingRemoval" :title="t('account_ui.remove_title')" width="30rem"
             append-to-body :close-on-click-modal="false" @update:model-value="pendingRemoval = null">
    <p>{{ pendingRemoval?.name }}</p>
    <p class="passkey-state">{{ t('account_ui.passkey_remove_description') }}</p>
    <template #footer><el-button @click="pendingRemoval = null">{{ cancelText }}</el-button><el-button type="danger" @click="removeSelectedPasskey">{{ t('account_ui.confirm_remove') }}</el-button></template>
  </el-dialog>
  <!--  inner dialog-->
  <el-dialog
      class="jus-apollo-user-passkeys-dialog-token-alias"
      v-model="innerVisible"
      :title="titleText"
      append-to-body
      :show-close="false"
      :close-on-click-modal="false"
      destroy-on-close
      @opened="passkeyDialogOpened"
      @close="closePasskeyAliasDialog"
  >
    <div class="jus-apollo-user-passkeys-dialog-passkey-alias-body">
      <InputShort class="jus-apollo-user-passkeys-dialog-passkey-alias-input" v-model="passkeyName"
                  maxlength="16" show-word-limit clearable :placeholder="inputPlaceholderText"
                        @keydown.enter="submitGeneratePasskey"/>

    </div>
    <template #footer>
      <el-button type="info" @click="closePasskeyAliasDialog">{{ cancelText }}</el-button>
      <el-button type="primary"
                 autofocus
                 ref="submitGeneratePasskeyButton"
                 @click="submitGeneratePasskey">
        {{ t('account_ui.add') }}
      </el-button>
    </template>
  </el-dialog>


  <div v-loading="store.userActionDialogLoading" element-loading-background="var(--jus-color-icarus-surface)">
    <div v-show="!store.userActionDialogLoading" class="jus-apollo-user-passkeys-dialog-body">
      <div class="jus-apollo-user-passkeys-dialog-body-content-header">
        <span class="jus-apollo-user-passkeys-dialog-body-content-header-text">{{ contentHeaderText }}</span>
        <button type="button" class="passkey-icon-button" :aria-label="titleText" @click="innerVisible = true; feedback = ''"><AddIcon class="jus-apollo-user-passkeys-dialog-body-content-header-icon" aria-hidden="true" /></button>
      </div>
      <div class="jus-apollo-user-passkeys-dialog-body-content-rows">
        <div v-if="loadError" class="passkey-state" role="alert">{{ t('account_ui.load_error') }} <el-button text type="primary" @click="loadPasskeys">{{ t('account_ui.retry') }}</el-button></div>
        <p v-else-if="!passkeys.length" class="passkey-state">{{ t('account_ui.no_passkeys') }}</p>
        <div
            v-for="passkey in passkeys"
            :key="passkey.id"
            class="jus-apollo-user-passkeys-dialog-body-content-row">
          <div class="left">
            <PasskeyIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-icon"/>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-name">{{ passkey.name }}</span>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-date">{{
                createdDateText(passkey)
              }}</span>
          </div>
          <button type="button" class="passkey-icon-button right" :aria-label="t('account_ui.remove_contact', { value: passkey.name })" @click="pendingRemoval = passkey; feedback = ''"><DeleteIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-delete-icon" aria-hidden="true" /></button>
        </div>
      </div>
      <p v-if="feedback" class="passkey-state" :class="{ error: !['passkey_added', 'passkey_removed'].includes(feedback) }" role="status">{{ t('account_ui.' + feedback) }}</p>
    </div>
  </div>
</template>

<style>
/* This dialog is teleported to body, outside the parent passkey dialog. */
.el-dialog.jus-apollo-user-passkeys-dialog-token-alias {
  --el-dialog-bg-color: var(--jus-color-icarus-surface);
  --el-text-color-primary: var(--jus-color-global-neutrals-text-primary);
  --el-text-color-regular: var(--jus-color-global-neutrals-text-primary);
  --el-text-color-secondary: var(--jus-color-global-neutrals-text-secondary);
  --el-text-color-placeholder: var(--jus-color-global-neutrals-text-placeholder);
  --el-fill-color-blank: var(--jus-color-icarus-surface);
  color: var(--jus-color-global-neutrals-text-primary);
  border-radius: .75rem;
}
</style>

<style scoped>
@import "@/assets/css/user/security/userPasskeysDialog.css";
.passkey-state { font-size: .875rem; line-height: 1.5; color: var(--jus-color-global-neutrals-text-secondary); margin-block: .75rem; }
.passkey-state.error { color: var(--jus-color-global-functional-error); }
.passkey-icon-button { border: 0; padding: 0; background: transparent; display: inline-flex; align-items: center; cursor: pointer; }
.passkey-icon-button:focus-visible { outline: 2px solid var(--jus-color-global-icon-blue); outline-offset: 4px; }
.jus-apollo-user-passkeys-dialog-passkey-alias-input {
  width: 20rem;
}


.jus-apollo-user-passkeys-dialog-passkey-alias-body {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem 0 1rem 0;
}

.jus-apollo-user-passkeys-dialog-body-content-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  color: var(--jus-color-global-neutrals-text-primary);
}

.jus-apollo-user-passkeys-dialog-body-content-header-text {

  font-size: 1.125rem;
  font-style: normal;
  font-weight: 600;
  line-height: 1.75rem; /* 155.556% */
  letter-spacing: 0.05625rem;
}

.jus-apollo-user-passkeys-dialog-body-content-header-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  aspect-ratio: 1/1;

  color: var(--jus-color-global-neutrals-text-primary);
  margin-right: 12px;

  cursor: pointer;
}

.jus-apollo-user-passkeys-dialog-body-content-rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 15rem;
  overflow: auto;
  padding-right: 12px;
}

.jus-apollo-user-passkeys-dialog-body-content-row {
  width: 100%;
}

.jus-apollo-user-passkeys-dialog-body-content-row,
.jus-apollo-user-passkeys-dialog-body-content-row .left {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.95rem;
}

.jus-apollo-user-passkeys-dialog-body-content-passkey-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  aspect-ratio: 1/1;

  color: var(--jus-color-global-icon-blue);
}

.jus-apollo-user-passkeys-dialog-body-content-passkey-delete-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  aspect-ratio: 1/1;

  color: var(--jus-color-global-neutrals-text-primary);
  cursor: pointer;
}

.jus-apollo-user-passkeys-dialog-body-content-passkey-date {
  color: var(--jus-color-global-neutrals-text-primary);
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 125% */
  letter-spacing: 0.08rem;
}

.jus-apollo-user-passkeys-dialog-body-content-passkey-name {
  width: 10rem;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: var(--jus-color-global-neutrals-text-primary);
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 125% */
}
</style>
