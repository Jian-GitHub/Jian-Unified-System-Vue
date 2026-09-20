<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { redirectToApollo } from '@/api/apollo'
const route = useRoute()
const { t, locale } = useI18n()
const message = computed(() => {
  const reason = route.query.reason
  if (reason === 'denied') return t('ui.apolloDidNotAllowThisAccessCheckYourAccountPermissions')
  if (reason === 'unavailable') return t('ui.theAuthenticationServiceIsUnavailablePleaseTryAgainLater')
  return t('ui.yourSessionOrLoginCallbackHasExpiredContinueThroughApolloAgain')
})
const returnTo = computed(() => typeof route.query.from === 'string' ? route.query.from : '/dashboard')
</script>
<template>
  <main class="auth-status">
    <h1>{{ t('ui.accessHephaestus') }}</h1>
    <p role="alert">{{ message }}</p>
    <el-button type="primary" @click="redirectToApollo(returnTo)">{{ t('ui.continueWithApollo') }}</el-button>
    <router-link to="/invoice">{{ t('ui.useThePublicInvoiceMaker') }}</router-link>
  </main>
</template>
<style scoped>
.auth-status { max-width: 540px; margin: 15vh auto; padding: 24px; line-height: 1.7; }
a { display: block; margin-top: 20px; }
</style>
