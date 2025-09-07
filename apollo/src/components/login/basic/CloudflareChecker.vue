<template>
  <div class="cloudflare-checker">
    <div class="cloudflare-checker-status">
      <SuccessIcon class="cloudflare-checker-status-icon"/>
      <div class="cloudflare-checker-status-text">
        <span class="cloudflare-checker-text-1">{{ status }}<span class="cloudflare-checker-text-2">!</span></span>
      </div>
    </div>
    <div class="cloudflare-checker-logo">
      <CloudflareLogo class="cloudflare-checker-logo-icon"/>
      <div class="cloudflare-checker-privacy">
        <span class="cloudflare-checker-privacy-text">{{ privacyText }}</span>
        <span class="cloudflare-checker-privacy-dot">·</span>
        <span class="cloudflare-checker-privacy-text">{{ regulationText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// CloudflareChecker 组件
import SuccessIcon from "@/assets/icon/success_20x20.svg";
import CloudflareLogo from "@/assets/logo/cloudflare_logo_text.svg";


import {useI18n} from 'vue-i18n'
import {computed, ComputedRef, ref, Ref} from "vue";
const {t, locale} = useI18n()
let success: Ref<boolean> = ref(true)
const status: ComputedRef<string> = computed(() => success ? t('cloudflareChecker.status.success') : t('cloudflareChecker.status.failed'))
const privacyText: ComputedRef<string> = computed(() => t('cloudflareChecker.privacy'))
const regulationText: ComputedRef<string> = computed(() => t('cloudflareChecker.terms'))
</script>

<style scoped>
.cloudflare-checker {
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  width: 21.875rem;
  height: 2.5rem;
  align-items: center;
  flex-shrink: 0;

  border-radius: 0.5rem;
  background: var(--jus-color-icarus-surface);

  /* Input/Inner Default */
  box-shadow: -2px -2px 4px 0 var(--jus-color-global-shadow-bottom-right) inset, 2px 2px 4px 0 var(--jus-color-global-shadow-top-left) inset;
}

.cloudflare-checker > :first-child {
  margin-left: 3.12rem;
}

.cloudflare-checker > :last-child {
  margin-right: 3.19rem;
}

.cloudflare-checker-status {
  height: 1.875rem;
  flex-shrink: 0;

  display: flex;
  flex-direction: row;
  gap: 0.3rem;
}

.cloudflare-checker-status-icon {
  width: 1.875rem;
  height: 1.875rem;
  flex-shrink: 0;
  aspect-ratio: 1/1;
}

.cloudflare-checker-status-text {
  color: var(--jus-color-global-neutrals-text-primary, #212121);
  font-size: 0.75rem;
  font-style: normal;
  line-height: normal;
  margin-left: 0.62rem;

  display: flex;
  justify-content: center;
  align-items: center;
}

.cloudflare-checker-text-1 {
  letter-spacing: 0.01125rem;
  font-weight: 500;
}

.cloudflare-checker-text-2 {
  margin-left: 0.12rem;
  font-weight: 500;
}








.cloudflare-checker-logo {
  padding-top: 2px;
  padding-bottom: 2px;
  width: 4.5625rem;
  height: 2.3125rem;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;   /* 让子元素上下排列 */
  align-items: flex-end;    /* 子元素靠右对齐 */
}

.cloudflare-checker-logo-icon {
  display: flex;
  width: 4.5625rem;
  height: 1.5625rem;
  padding: 0 0 0.06788rem 0.3125rem;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 0.1875rem;
  flex-shrink: 0;
  aspect-ratio: 73/25;
  color: var(--jus-color-global-neutrals-text-primary);
}

.cloudflare-checker-privacy {
  height: 0.6875rem;
  display: flex;
  align-items: flex-end;    /* 子元素靠右对齐 */
}
.cloudflare-checker-privacy-text {
  color: var(--jus-color-global-neutrals-text-primary, #212121);
  font-family: "PingFang SC";
  font-size: 0.4375rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;

}
.cloudflare-checker-privacy-dot {
  color: var(--jus-color-global-neutrals-text-primary, #212121);
  font-family: "PingFang SC";
  font-size: 0.4375rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>
