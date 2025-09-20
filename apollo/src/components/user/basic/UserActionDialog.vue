<script setup lang="ts">
import {computed, ref} from 'vue';
import {useSessionStore} from "@/store";
import CloseIcon from "@/assets/icon/close_bold_20x20.svg"

const store = useSessionStore()

import {useI18n} from "vue-i18n";

const {t} = useI18n()


import UserPasskeysActionDialogBody from "@/components/user/basic/dialog/passkeys/UserPasskeysActionDialogBody.vue";
import UserPasskeysActionDialogHeader from "@/components/user/basic/dialog/passkeys/UserPasskeysActionDialogHeader.vue";
import UserAccountSecurityActionDialogHeader
  from "@/components/user/basic/dialog/accountSecurity/UserAccountSecurityActionDialogHeader.vue";
import UserAccountSecurityActionDialogBody
  from "@/components/user/basic/dialog/accountSecurity/UserAccountSecurityActionDialogBody.vue";
import {UserActionDialogData} from "@/types/dialog/UserAction";

// actions[200] = 5
// console.log(actions['200'])

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
const dialogs: Record<number, UserActionDialogData> = {
  202: {
    className: {
      class: 'jus-apollo-user-passkeys-dialog',
      header: 'jus-apollo-user-passkeys-dialog-header',
      body: 'jus-apollo-user-passkeys-dialog-body',
      footer: 'jus-apollo-user-passkeys-dialog-footer'
    },
    component: {
      header: UserAccountSecurityActionDialogHeader,
      body: UserAccountSecurityActionDialogBody,
      footer: null
    }
  },
  204: {
    className: {
      class: 'jus-apollo-user-passkeys-dialog',
      header: 'jus-apollo-user-passkeys-dialog-header',
      body: 'jus-apollo-user-passkeys-dialog-body',
      footer: 'jus-apollo-user-passkeys-dialog-footer'
    },
    component: {
      header: UserPasskeysActionDialogHeader,
      body: UserPasskeysActionDialogBody,
      footer: null
    }
  }
}

const dialogData = computed(() => {
  if (!store.actionsIds.infoActions.includes(store.userActionDialogId) && !store.actionsIds.securityActions.includes(store.userActionDialogId)) {
    return {} as UserActionDialogData
  }
  return dialogs[store.userActionDialogId]
})
</script>

<template>
  <el-dialog
      :class="dialogData.className.class"
      v-model="store.userActionDialogVisible"
      v-if="store.userActionDialogVisible"
      destroy-on-close
      center
      lock-scroll
      :close-icon="CloseIcon"
      :header-class="dialogData.className.header"
      :body-class="dialogData.className.body"
      :footer-class="dialogData.className.footer"
      @open="console.log('open')"
  >
    <template #header>
      <component :is="dialogData.component.header"/>
    </template>
    <component :is="dialogData.component.body"/>
    <template #footer>
      <component :is="dialogData.component.footer"/>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>

<style>
@import "@/assets/css/user/security/userPasskeysDialog.css";


</style>