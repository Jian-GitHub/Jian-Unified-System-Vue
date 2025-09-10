<script setup lang="ts">
import {ComputedRef} from "vue"
import type {Component} from "vue"
import {useI18n} from 'vue-i18n'

const {locale} = useI18n()

function setThirdPartyContinueButtonClass(type: boolean): string {
  if (locale.value === 'zh') {
    return type ? 'third-party-button-userContainer-zh' : 'third-party-button-userContainer-zh-spacing'
  }
}

defineProps<{
  icon: Component,
  text: ComputedRef<string>,
}>()

</script>

<template>
  <button class="third-party-button">
    <div :class="['third-party-button-content', setThirdPartyContinueButtonClass(true)]">
      <component :is="icon" class="third-party-button-content-icon"/>
      <span :class="[ 'third-party-button-content-text', setThirdPartyContinueButtonClass(false)]">{{ text }}</span>
    </div>
  </button>
</template>

<style scoped>
@import "@/assets/css/login/container/thirdPartyButton.css";

.third-party-button {
  display: flex;
  width: 21rem;
  height: 3.125rem;
  justify-content: flex-start;
  align-items: center;
  gap: 0.3125rem;
  flex-shrink: 0;

  border-radius: 0.625rem;
  background: var(--jus-color-global-shadow-bottom-right);

  /* Default Shadow */
  box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.3);
  cursor: pointer;

  color: var(--jus-color-global-neutrals-text-primary);
  -webkit-user-select: none; /* Safari / iOS / Chrome WebKit */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE/Edge */
  user-select: none; /* 标准 */

  border: 1px solid transparent;
}


.third-party-button-content {
  height: calc(100% - 2px);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;

  margin-left: 3.8rem;
}

.third-party-button-content-icon {
  width: 2.25rem;
  height: 2.25rem;
  aspect-ratio: 1/1;
  display: flex;
  align-items: flex-start;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15)) drop-shadow(0 1px 4px var(--jus-color-icarus-secondary-300));
}

.third-party-button-content-text {
  color: var(--jus-color-global-neutrals-text-primary);

  /* Web/Button/Login */
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.5rem; /* 150% */

}

.third-party-button-content-zh-spacing {
  letter-spacing: 0.02rem;
}
.third-party-button-content-zh {
  margin-left: 5.2rem;
}
</style>