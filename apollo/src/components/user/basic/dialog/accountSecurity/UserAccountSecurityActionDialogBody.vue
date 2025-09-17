<script setup lang="ts">
import TokenIcon from "@/assets/icon/key_20x20.svg";
import AddIcon from "@/assets/icon/plus_20x20.svg";
import DeleteIcon from "@/assets/icon/remove_20x20.svg";
import {computed, ref} from "vue";
import {nextTick} from 'vue'
import {useI18n} from "vue-i18n";
import {useGlobalStore} from "@/store";
import {AccountSecurityTokenDialogRowData} from "@/types/dialog/security/AccountSecurityToken";
import {ElMessage} from "element-plus";
import InputShort from "@/components/Input/InputShort.vue";
import QuantumLogo from "@/assets/logo/quantum_20x20.svg";
import TokenScopeSelector from "@/components/user/basic/dialog/accountSecurity/TokenScopeSelector.vue";

const {t} = useI18n()
const store = useGlobalStore()

const contentHeaderText = computed(() => t('user_action_dialog.account_security.content.header', {num: store.user.security.accountSecurityTokenNum}))

const createdDateText = (token: AccountSecurityTokenDialogRowData) => computed(() => t('user_action_dialog.account_security.content.row.date', {
  year: token.date.year,
  month: token.date.month,
  day: token.date.day
}))

const tokens: AccountSecurityTokenDialogRowData[] = [
  {
    name: "Chaos",
    value: "esdckjznouierljfdknvkl;lafnjkvdfjnjbkrrfda",
    date: {
      year: 2023,
      month: 11,
      day: 1,
    }
  },
  {
    name: "Chaos aksdlanl saflmkdvkl",
    value: "esdckjznouierljfdknvkl;lafnjkvdfjnjbkrrfda",
    date: {
      year: 2023,
      month: 11,
      day: 9,
    }
  },
]

async function copy(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // 现代浏览器
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
    // 兼容性方案：用 textarea + execCommand
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
const tokenAlias = ref('')
const tokenAliasButton = ref(null)

const options = [
  {
    id: 0,
    icon: QuantumLogo,
    label: "JQuantum",
  },
  {
    id: 1,
    icon: QuantumLogo,
    label: "Argus",
  }
]

function tokenAliasDialogOpened() {
  nextTick(() => {
    tokenAliasButton.value?.$el?.focus()
  })
}

function beforeTokenAliasDialogOpened() {
  options.forEach((option) => {
    value.value.push(option.id)
  })
}

function closeTokenAliasDialog() {
  console.log("a")
  tokenAlias.value = '';
  value.value = []
}

function submitTokenAlias() {
  innerVisible.value = false;
  tokenAlias.value = '';

  console.log(value.value.length)
  console.log(value.value)
  /**
   TODO: submitTokenAlias
   alias -> Server
   Server -> status & token value
   - success -> update table & el-notification
   - failed -> el-notification
   */
}

const value = ref<number[]>([])

// const colors = [
//   {
//     value: '#4070D4',
//     label: 'JQuantum',
//   },
//   {
//     value: '#E63415',
//     label: 'red',
//   },
//   {
//     value: '#FF6600',
//     label: 'orange',
//   },
//   {
//     value: '#FFDE0A',
//     label: 'yellow',
//   },
//   {
//     value: '#1EC79D',
//     label: 'green',
//   },
//   {
//     value: '#14CCCC',
//     label: 'cyan',
//   },
//   {
//     value: '#4167F0',
//     label: 'blue',
//   },
//   {
//     value: '#6222C9',
//     label: 'purple',
//   },
// ]



// function getLabel(colorValue) {
//   const item = colors.find(c => c.value === colorValue)
//   return item?.label ?? colorValue
// }
// function remove(color) {
//   const idx = value.value.indexOf(color)
//   if (idx !== -1) value.value.splice(idx, 1)
// }
</script>

<template>
  <el-dialog
      class="jus-apollo-user-account-security-dialog-token-alias"
      v-model="innerVisible"
      title="设置令牌别名 (可选) 和作用域"
      append-to-body
      :show-close="false"
      :close-on-click-modal="false"
      destroy-on-close
      @opened="tokenAliasDialogOpened"
      @open="beforeTokenAliasDialogOpened"
      @close="closeTokenAliasDialog"
  >
    <div class="jus-apollo-user-account-security-dialog-token-alias-body">
      <InputShort class="jus-apollo-user-account-security-dialog-token-alias-input" v-model="tokenAlias"
                  maxlength="16" show-word-limit clearable placeholder="别名 (可选)"/>
<!--                  @keydown.enter="submitTokenAlias"/>-->

      <TokenScopeSelector v-model="value" :options="options"/>

    </div>
    <template #footer>
      <el-button type="info" @click="innerVisible = false; tokenAlias = ''">取消</el-button>
      <el-button type="primary"
                 autofocus
                 ref="tokenAliasButton"
                 :disabled="value.length === 0"
                 @click="submitTokenAlias">
        {{ '确定' }}
      </el-button>
    </template>
  </el-dialog>

  <div v-loading="store.userActionDialogLoading" element-loading-background="var(--jus-color-icarus-surface)">
    <div v-show="!store.userActionDialogLoading" class="jus-apollo-user-passkeys-dialog-body">
      <div class="jus-apollo-user-passkeys-dialog-body-content-header">
        <span class="jus-apollo-user-passkeys-dialog-body-content-header-text">{{ contentHeaderText }}</span>
        <AddIcon class="jus-apollo-user-passkeys-dialog-body-content-header-icon icon" tabindex="0"
                 @click="innerVisible = true"/>
      </div>
      <div class="jus-apollo-user-passkeys-dialog-body-content-rows">
        <div
            v-for="(token, index) in tokens"
            :key="index"
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
  width: 12rem;

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