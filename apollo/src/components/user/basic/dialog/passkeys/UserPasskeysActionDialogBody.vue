<script setup lang="ts">
import PasskeyIcon from "@/assets/icon/passkey_20x20.svg";
import AddIcon from "@/assets/icon/plus_20x20.svg";
import DeleteIcon from "@/assets/icon/remove_20x20.svg";
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useSessionStore} from "@/store";
import {PasskeysDialogRowData} from "@/types/dialog/security/Passkeys";

const {t} = useI18n()
const store = useSessionStore()

const contentHeaderText = computed(() => t('user_action_dialog.passkeys.content.header', {num: store.user.security.passkeysNum}))

const createdDateText = (passkey: PasskeysDialogRowData) => computed(() => t('user_action_dialog.passkeys.content.row.date', {
  year: passkey.date.year,
  month: passkey.date.month,
  day: passkey.date.day
}))

const passkeys: PasskeysDialogRowData[] = [
  {
    displayName: "Chaos", date: {
      year: 2023,
      month: 11,
      day: 1
    }
  },
  {
    displayName: "Apollo", date: {
      year: 2024,
      month: 12,
      day: 3
    }
  },
  {
    displayName: "Apollo", date: {
      year: 2024,
      month: 12,
      day: 3
    }
  },
  {
    displayName: "Apollo", date: {
      year: 2024,
      month: 12,
      day: 3
    }
  },
  {
    displayName: "Apollo", date: {
      year: 2024,
      month: 12,
      day: 3
    }
  },
  {
    displayName: "Apollo", date: {
      year: 2024,
      month: 12,
      day: 3
    }
  },
  {
    displayName: "Apollo", date: {
      year: 2024,
      month: 12,
      day: 3
    }
  },
  {
    displayName: "Apollo", date: {
      year: 2024,
      month: 12,
      day: 3
    }
  },
  {
    displayName: "Apollo", date: {
      year: 2024,
      month: 12,
      day: 3
    }
  },
  {
    displayName: "Argus Created at 2025-09-12 12:55:04", date: {
      year: 2024,
      month: 5,
      day: 22
    }
  }
]
</script>

<template>
  <div v-loading="store.userActionDialogLoading" element-loading-background="var(--jus-color-icarus-surface)">
    <div v-show="!store.userActionDialogLoading" class="jus-apollo-user-passkeys-dialog-body">
      <div class="jus-apollo-user-passkeys-dialog-body-content-header">
        <span class="jus-apollo-user-passkeys-dialog-body-content-header-text">{{ contentHeaderText }}</span>
        <AddIcon class="jus-apollo-user-passkeys-dialog-body-content-header-icon"/>
      </div>
      <div class="jus-apollo-user-passkeys-dialog-body-content-rows">
        <div
            v-for="(passkey, index) in passkeys"
            :key="index"
            class="jus-apollo-user-passkeys-dialog-body-content-row">
          <div class="left">
            <PasskeyIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-icon"/>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-name">{{ passkey.displayName }}</span>
            <span class="jus-apollo-user-passkeys-dialog-body-content-passkey-date">{{
                createdDateText(passkey)
              }}</span>
          </div>
          <DeleteIcon class="jus-apollo-user-passkeys-dialog-body-content-passkey-delete-icon right"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/user/security/userPasskeysDialog.css";
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