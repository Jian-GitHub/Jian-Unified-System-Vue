<script setup lang="ts">

import PasskeysIcon from "@/assets/logo/passkeys_outline_20x20.svg";
import GitHubLogo from "@/assets/logo/github_20x20.svg";
import {computed} from "vue";
import {useSessionStore} from "@/store";
import {useI18n} from "vue-i18n";
const store = useSessionStore()
const {t} = useI18n()

const titleText = computed(() => t('user_action_dialog.third_party_accounts.title')) //t('user_action_dialog.passkeys.title'))
const line1Text = computed(() => t('user_action_dialog.third_party_accounts.line1')) //t('user_action_dialog.passkeys.line1', {num: store.user.security.passkeysNum}))
const line2Text = computed(() => '') //t('user_action_dialog.passkeys.line2'))
</script>

<template>
  <component :is="GitHubLogo" class="icon"/>
  <span class="title">{{ titleText }}</span>
  <span class="line1">{{ line1Text }}</span>
  <span class="line2">{{ line2Text }}</span>
</template>

<style scoped>


.jus-apollo-user-third-party-dialog-header .icon {
  width: 3.25rem;
  height: 3.25rem;
  flex-shrink: 0;
  color: var(--jus-color-global-icon-blue)
}

.jus-apollo-user-third-party-dialog-header .title {
  width: 100%;
  margin-top: 0.75rem;
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2rem;
  letter-spacing: 0.03rem;
}


.jus-apollo-user-third-party-dialog-header .line1 {

  margin-top: 1.31rem;

  text-align: center;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 142.857% */
}

.jus-apollo-user-third-party-dialog-header .line2 {
  margin-top: 1.31rem;

  text-align: center;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25rem; /* 142.857% */
}
</style>