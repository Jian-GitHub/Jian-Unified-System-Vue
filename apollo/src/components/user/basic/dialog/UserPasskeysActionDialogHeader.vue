<script setup lang="ts">

import PasskeysIcon from "@/assets/logo/passkeys_outline_20x20.svg";
import {computed} from "vue";
import {useGlobalStore} from "@/store";
import {useI18n} from "vue-i18n";
const store = useGlobalStore()
const {t} = useI18n()

const titleText = computed(() => t('user_dialog.user_passkeys.title'))
const line1Text = computed(() => t('user_dialog.user_passkeys.line1', {num: store.user.security.passkeysNum}))
const line2Text = computed(() => t('user_dialog.user_passkeys.line2'))
</script>

<template>
  <component :is="PasskeysIcon" class="icon"/>
  <span class="title">{{ titleText }}</span>
  <span class="line1">{{ line1Text }}</span>
  <span class="line2">{{ line2Text }}</span>
</template>

<style scoped>
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
</style>