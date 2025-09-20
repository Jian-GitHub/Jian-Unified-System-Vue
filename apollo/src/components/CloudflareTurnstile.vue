<script setup lang="ts">
import VueTurnstile from "vue-turnstile"
import {useI18n} from 'vue-i18n'
const {t, locale} = useI18n()
import {useSessionStore} from "@/store";

const globalStore = useSessionStore();

import { cf_token } from "@/assets/logic/cloudflareTurnstile";
import {computed, ComputedRef, ref} from "vue";

defineProps<{
  show: boolean;
  action: string;
}>()

const turnstile = ref(null)
const loadingText: ComputedRef<string> = computed(() => t('cloudflare.turnstile.loadingText'))
/*
0x4AAAAAAANVWc7MkXgqcP22
1x00000000000000000000AA	Always passes                   visible
2x00000000000000000000AB	Always blocks                   visible
1x00000000000000000000BB	Always passes                   invisible
2x00000000000000000000BB	Always blocks                   invisible
3x00000000000000000000FF	Forces an interactive challenge visible
*/
</script>

<template>
    <div class="cloudflare-checker-box">
      <div v-loading="true" element-loading-background="transparent" class="cloudflare-checker-loading">
        <span class="cloudflare-checker-loading-text">{{ loadingText }}</span>
      </div>
      <vue-turnstile class="cf"
                     v-if="show"
                     site-key="1x00000000000000000000AA"
                     v-model="cf_token"
                     ref="turnstile"
                     size="flexible"
                     :action="action"
                     :language="locale"
                     :theme="globalStore.theme as 'dark' | 'light' | 'auto'"/>
    </div>
</template>
<style>
.cloudflare-checker-loading .el-loading-mask {
  opacity: 1;
}
.cloudflare-checker-loading .el-loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
}
.cloudflare-checker-loading .el-loading-spinner .path {
  stroke: var(--jus-color-icarus-primary-300) !important;
  stroke-width: 3 !important;
}
.cloudflare-checker-loading .el-loading-spinner svg {
  width: 3rem !important;
  height: 3rem !important;
}
</style>
<style scoped>

.cloudflare-checker-loading-text {
  color: var(--jus-color-global-neutrals-text-primary);
}

.cloudflare-checker-loading {
  z-index: 0;
  position: absolute;
  align-items: center;
  justify-content: center;
  text-align: center;
}


.cf {
  z-index: 1;
  width: calc(21.875rem + 20px);
  height: 3.5rem;
  margin-top: -5px;
  margin-left: 20px;
  margin-right: -2px;
  padding-bottom: 65px;
  padding-right: 320px;

  overflow: hidden;
  border-radius: 0.5rem;
}

.cloudflare-checker-box {
  width: 21.875rem;
  height: 3.5rem;
  align-items: center;
  justify-content: center;
  padding-top: 0.2rem;
  display: flex;
  overflow: hidden;

  flex-shrink: 0;

  border-radius: 0.5rem;
  background: var(--jus-color-doraemon-surface);

  /* Input/Inner Default */
  /*box-shadow: -2px -2px 4px 0 var(--jus-color-global-shadow-bottom-right) inset, 2px 2px 4px 0 var(--jus-color-global-shadow-top-left) inset;

   */
  box-shadow: 0 1px inset var(--jus-color-icarus-surface);
}
</style>