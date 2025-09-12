<script setup lang="ts">
import {computed} from 'vue';
import {useGlobalStore} from "@/store";
import CloseIcon from "@/assets/icon/close_bold_20x20.svg"
import PasskeysIcon from "@/assets/logo/passkeys_outline_20x20.svg"
import PasskeyAddIcon from "@/assets/icon/plus_20x20.svg"
import PasskeyIcon from "@/assets/icon/passkey_20x20.svg"
import PasskeyDeleteIcon from "@/assets/icon/remove_20x20.svg"

const store = useGlobalStore()

import {useI18n} from "vue-i18n";

const {t} = useI18n()

const titleText = computed(() => t('user_dialog.user_passkeys.title'))
const line1Text = computed(() => t('user_dialog.user_passkeys.line1', {num: store.user.security.passkeysNum}))
const line2Text = computed(() => t('user_dialog.user_passkeys.line2'))
const contentHeaderText = computed(() => t('user_dialog.user_passkeys.content.header', {num: store.user.security.passkeysNum}))

const contentRowText = (data: PasskeysDialogRowData) => computed(() => t('user_dialog.user_passkeys.content.row.date', {year: data.date.year, month: data.date.month, day: data.date.day}))

type PasskeysDialogRowData = {
  displayName: string,
  date: {
    year: string,
    month: string,
    day: string
  }
}
const datas: PasskeysDialogRowData[] = [
  {
    displayName: "Chaos", date: {
      year: '2023',
      month: '11',
      day: '01'
    }
  },
  {
    displayName: "Apollo", date: {
      year: '2024',
      month: '12',
      day: '03'
    }
  },
  {
    displayName: "Argus Created at 2025-09-12 12:55:04", date: {
      year: '2024',
      month: '05',
      day: '22'
    }
  }
]
</script>

<template>
  <el-dialog
      class="jus-apollo-user-passkeys-dialog"
      v-model="store.userPasskeysDialogVisible"
      destroy-on-close
      center
      lock-scroll
      :close-icon="CloseIcon"
      header-class="jus-apollo-user-passkeys-dialog-header"
      body-class="jus-apollo-user-passkeys-dialog-body"
  >
    <template #header>
      <component :is="PasskeysIcon" class="icon"/>
      <span class="title">{{ titleText }}</span>
      <span class="line1">{{ line1Text }}</span>
      <span class="line2">{{ line2Text }}</span>
    </template>
    <template #default>
      <div class="jus-apollo-user-passkeys-dialog-body-content-header">
        <span class="jus-apollo-user-passkeys-dialog-body-content-header-text">{{ contentHeaderText }}</span>
        <PasskeyAddIcon class="jus-apollo-user-passkeys-dialog-body-content-header-icon"/>
      </div>
      <div class="jus-apollo-user-passkeys-dialog-body-content-rows">
        <div
            v-for="(data, index) in datas"
            :key="index"
            class="jus-apollo-user-passkeys-dialog-body-content-row">
          <div class="left">
            <PasskeyIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-icon"/>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-name">{{ data.displayName }}</span>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-date">{{ contentRowText(data) }}</span>
          </div>
          <PasskeyDeleteIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-delete-icon right"/>
        </div>

<!--        <div class="jus-apollo-user-passkeys-dialog-body-content-row">-->
<!--          <div class="left">-->
<!--            <PasskeyIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-icon"/>-->
<!--            <span-->
<!--                class="jus-apollo-user-passkeys-dialog-body-content-passkey-name">卡俄asdadas阿萨德卡上的卡还是空间d斯</span>-->
<!--            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-date">2024-12-03</span>-->
<!--          </div>-->
<!--          <PasskeyDeleteIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-delete-icon right"/>-->
<!--        </div>-->
      </div>
    </template>

    <!--    <template #footer>-->
    <!--      <div class="dialog-footer">-->
    <!--        <el-button @click="globalStore.userPasskeysDialogVisible = false">Cancel</el-button>-->
    <!--        <el-button type="primary" @click="globalStore.userPasskeysDialogVisible = false">-->
    <!--          Confirm-->
    <!--        </el-button>-->
    <!--      </div>-->
    <!--    </template>-->
  </el-dialog>
</template>

<style scoped>
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
}

.jus-apollo-user-passkeys-dialog-header .title {
  margin-top: 0.75rem;
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2rem;
  letter-spacing: 0.03rem;
}


.jus-apollo-user-passkeys-dialog-header .line1 {
  margin-top: 0.81rem;

  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5rem; /* 150% */
  letter-spacing: 0.05rem;
}

.jus-apollo-user-passkeys-dialog-header .line2 {
  margin-top: 1.31rem;

  text-align: center;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 142.857% */
}


.jus-apollo-user-passkeys-dialog-body-content-rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
<style>
@import "@/assets/css/user/security/userPasskeysDialog.css";


</style>