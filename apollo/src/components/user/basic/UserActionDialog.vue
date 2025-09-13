<script setup lang="ts">
import {computed, ref} from 'vue';
import {useGlobalStore} from "@/store";
import CloseIcon from "@/assets/icon/close_bold_20x20.svg"
import PasskeysIcon from "@/assets/logo/passkeys_outline_20x20.svg"
import PasskeyAddIcon from "@/assets/icon/plus_20x20.svg"
import PasskeyIcon from "@/assets/icon/passkey_20x20.svg"
import PasskeyDeleteIcon from "@/assets/icon/remove_20x20.svg"

const store = useGlobalStore()

import {useI18n} from "vue-i18n";
import {PasskeysDialogRowData} from "@/types/user";

const {t} = useI18n()


import UserPasskeysActionDialogBody from "@/components/user/basic/dialog/UserPasskeysActionDialogBody.vue";
import UserPasskeysActionDialogHeader from "@/components/user/basic/dialog/UserPasskeysActionDialogHeader.vue";

const actions: Record<number, number> = {
  100: 2,
}
actions[200] = 5
console.log(actions['200'])

/*

classname
  class
  header-class
  body-class
  footer-class

header
  component
body
  component
footer
  component
 */


</script>

<template>
  <el-dialog
      class="jus-apollo-user-passkeys-dialog"
      v-model="store.userActionDialogVisible"
      destroy-on-close
      center
      lock-scroll
      :close-icon="CloseIcon"
      header-class="jus-apollo-user-passkeys-dialog-header"
      body-class="jus-apollo-user-passkeys-dialog-body"
      footer-class="jus-apollo-user-passkeys-dialog-footer"
  >
    <template #header>
      <component :is="UserPasskeysActionDialogHeader"/>
    </template>
    <div v-loading="store.userActionDialogLoading" element-loading-background="var(--jus-color-icarus-surface)"
         style="height: 18rem">
      <div v-show="!store.userActionDialogLoading" class="jus-apollo-user-passkeys-dialog-body">
        <component :is="UserPasskeysActionDialogBody"/>
      </div>
    </div>
    <template #footer>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>

<style>
@import "@/assets/css/user/security/userPasskeysDialog.css";

.el-loading-spinner .path {
  stroke: #F4BEBD;
  stroke-width: 3.5;
}

.el-loading-spinner {
  top: 35%;
}

.el-loading-spinner .circular {
  width: 5rem;
  height: 5rem;
}
</style>