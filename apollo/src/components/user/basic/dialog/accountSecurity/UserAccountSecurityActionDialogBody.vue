<script setup lang="ts">
import TokenIcon from "@/assets/icon/key_20x20.svg";
import AddIcon from "@/assets/icon/plus_20x20.svg";
import DeleteIcon from "@/assets/icon/remove_20x20.svg";
import {computed, ComputedRef, onMounted, Ref, ref} from "vue";
import {nextTick} from 'vue'
import {useI18n} from "vue-i18n";
import {useSessionStore} from "@/store";
import {ElMessage} from "element-plus";
import InputShort from "@/components/Input/InputShort.vue";
import QuantumLogo from "@/assets/logo/quantum_20x20.svg";
import TokenScopeSelector from "@/components/user/basic/dialog/accountSecurity/TokenScopeSelector.vue";
import {GenerateSubsystemToken, GetTenSubsystemTokens, SubsystemToken} from "@/api/AccountActions";

const {t} = useI18n()
const store = useSessionStore()

const contentHeaderText = computed(() => t('user_action_dialog.account_security.content.header', {num: store.user.security.accountSecurityTokenNum}))

const createdDateText = (token: SubsystemToken) => computed(() => t('user_action_dialog.account_security.content.row.date', {
  year: token.date.year,
  month: token.date.month < 10 ? '0' + token.date.month.toString() : token.date.month,
  day: token.date.day < 10 ? '0' + token.date.day.toString() : token.date.day,
}))

const tokens: Ref<SubsystemToken[]> = ref([])
// const tokens: Ref<AccountSecurityTokenDialogRowData[]> = ref([
//   {
//     id: '1',
//     name: "Chaos",
//     value: "esdckjznouierljfdknvkl;lafnjkvdfjnjbkrrfda",
//     date: {
//       year: 2023,
//       month: 11,
//       day: 1,
//     }
//   },
//   {
//     id: '2',
//     name: "Chaos aksdlanl saflmkdvkl",
//     value: "esdckjznouierljfdknvkl;lafnjkvdfjnjbkrrfda",
//     date: {
//       year: 2023,
//       month: 11,
//       day: 9,
//     }
//   },
// ])

async function copy(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => {
      ElMessage({
        message: `Token copied successfully!`,
        type: 'success',
        placement: 'top',
        grouping: true,
        duration: 1000
      })
    }).catch(e => {
      ElMessage({
        message: `Token copied failed!`,
        type: 'error',
        placement: 'top',
        grouping: true,
        duration: 1000
      })
    })
  } else {
    // textarea + execCommand
    const input = document.createElement("textarea")
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand("copy")
    document.body.removeChild(input)

    ElMessage({
      message: `Token copied successfully!`,
      type: 'success',
      placement: 'top',
      grouping: true,
      duration: 1000
    })
    return Promise.resolve()
  }
}

const innerVisible = ref(false)
const tokenName = ref('')
const submitGenerateSubsystemTokenButton = ref(null)

const options = [
  {
    id: 1,
    icon: QuantumLogo,
    label: "JQuantum",
  },
  {
    id: 1 << 1,
    icon: QuantumLogo,
    label: "Argus",
  }
]

function tokenDialogOpened() {
  nextTick(() => {
    submitGenerateSubsystemTokenButton.value?.$el?.focus()
  })
}

function beforeTokenDialogOpened() {
  options.forEach((option) => {
    scope.value.push(option.id)
  })
}

function closeTokenAliasDialog() {
  tokenName.value = '';
  scope.value = []
}

async function doGenerateSubsystemToken() {
  const resp = await GenerateSubsystemToken(tokenName.value, scope.value)
  if (resp.status != 200 || resp.data.code != 200) {
    console.log('err', resp.data.message);
    return;
  }
  store.user.security.accountSecurityTokenNum++;
  tokens.value.unshift(resp.data.data.token);
}
async function submitGenerateSubsystemToken() {
  innerVisible.value = false;
  store.userActionDialogLoading = true
  try {
    await doGenerateSubsystemToken()
  }catch (e) {
    console.log('err', e.message)
  }
  store.userActionDialogLoading = false;
  tokenName.value = '';
}

const queryTokens = async () => {
  const response = await GetTenSubsystemTokens(page.value);
  if (response.status != 200 || response.data.code != 200) {
    console.log('error', response.data.message);
    return;
  }
  tokens.value = []
  response.data.data.tokens.forEach((token) => {
    tokens.value.push(token);
  })
  store.user.security.accountSecurityTokenNum = response.data.data.tokens.length;
}

const scope = ref<number[]>([])
const page: Ref<number> = ref(1);
onMounted(async () => {
  store.userActionDialogLoading = true
  try {
    await queryTokens()
  } catch (e) {
    console.log(e.message)
  }
  store.userActionDialogLoading = false

  // setTimeout(() => {
  //   store.userActionDialogLoading = false
  // }, 1250)
})

const titleText: ComputedRef<string> = computed(() => t('security_page.actions.security.generate.title'))
const inputPlaceholderText: ComputedRef<string> = computed(() => t('security_page.actions.security.generate.inputPlaceholder'))
const cancelText: ComputedRef<string> = computed(() => t('security_page.actions.security.cancel'))
const confirmText: ComputedRef<string> = computed(() => t('security_page.actions.security.confirm'))
</script>

<template>
  <!--  inner dialog-->
  <el-dialog
      class="jus-apollo-user-account-security-dialog-token-alias"
      v-model="innerVisible"
      :title="titleText"
      append-to-body
      :show-close="false"
      :close-on-click-modal="false"
      destroy-on-close
      @opened="tokenDialogOpened"
      @open="beforeTokenDialogOpened"
      @close="closeTokenAliasDialog"
  >
    <div class="jus-apollo-user-account-security-dialog-token-alias-body">
      <InputShort class="jus-apollo-user-account-security-dialog-token-alias-input" v-model="tokenName"
                  maxlength="16" show-word-limit clearable :placeholder="inputPlaceholderText"/>
      <!--                  @keydown.enter="submitGenerateSubsystemToken"/>-->

      <TokenScopeSelector v-model="scope" :options="options"/>

    </div>
    <template #footer>
      <el-button type="info" @click="innerVisible = false; tokenName = ''">{{ cancelText }}</el-button>
      <el-button type="primary"
                 autofocus
                 ref="submitGenerateSubsystemTokenButton"
                 :disabled="scope.length === 0"
                 @click="submitGenerateSubsystemToken">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>

  <!-- body content -->
  <div v-loading="store.userActionDialogLoading" element-loading-background="var(--jus-color-icarus-surface)">
    <div v-show="!store.userActionDialogLoading" class="jus-apollo-user-passkeys-dialog-body">
      <div class="jus-apollo-user-passkeys-dialog-body-content-header">
        <span class="jus-apollo-user-passkeys-dialog-body-content-header-text">{{ contentHeaderText }}</span>
        <AddIcon class="jus-apollo-user-passkeys-dialog-body-content-header-icon icon" tabindex="0"
                 @click="innerVisible = true"/>
      </div>
      <div class="jus-apollo-user-passkeys-dialog-body-content-rows">
        <div
            v-for="token in tokens"
            :key="token.id"
            class="jus-apollo-user-passkeys-dialog-body-content-row">
          <div class="left">
            <TokenIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-icon"/>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-name">{{ token.name }}</span>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-value"
                  @click="copy(token.value)"
                  @keydown.enter="copy(token.value)"
                  @keydown.space.prevent="copy(token.value)"
                  tabindex="0">
              {{ token.value }}
            </span>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-date">{{
                createdDateText(token)
              }}</span>
          </div>
          <DeleteIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-delete-icon right icon" tabindex="0"/>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
@import "@/assets/css/user/security/userPasskeysDialog.css";


.jus-apollo-user-account-security-dialog-token-alias-input {
  width: 12rem;
}


.jus-apollo-user-account-security-dialog-token-alias-body {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
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

.jus-apollo-user-passkeys-dialog-body-content-passkey-delete-icon.right.icon:hover,
.jus-apollo-user-passkeys-dialog-body-content-header-icon.icon:hover {
  filter: drop-shadow(0 0 1px var(--jus-color-global-neutrals-text-secondary));
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
  gap: 1.5rem;
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
  width: 5rem;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: var(--jus-color-global-neutrals-text-primary);
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 125% */
}

.jus-apollo-user-passkeys-dialog-body-content-passkey-value:hover {
  text-shadow: 0 0 4px var(--jus-color-global-neutrals-text-secondary);
  overflow: hidden;
}

.jus-apollo-user-passkeys-dialog-body-content-passkey-value {
  width: 11rem;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: var(--jus-color-global-neutrals-text-primary);
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 125% */

  cursor: pointer;
}
</style>