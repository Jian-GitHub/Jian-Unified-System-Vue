<script setup lang="ts">
import type {UserPageContent} from "@/types/user";

import {useI18n} from "vue-i18n";

const {locale} = useI18n()

import {useGlobalStore} from "@/store";
import {ElLoading} from "element-plus";

const globalStore = useGlobalStore();

const cardIconColorClass = (cardIsDanger: boolean) => {
  if (cardIsDanger == null || cardIsDanger === false) return '';
  switch (locale.value) {
    case 'zh':
      return 'cn';
    case 'ja':
      return 'jp';
    case 'ko':
      return 'kr';
    case 'en':
      return 'us';
    default:
      return 'defaultRed';
  }
}

defineProps<{
  pageContent: UserPageContent
}>()


function openActionDialog() {
  globalStore.userActionDialogVisible = true
  globalStore.userActionDialogLoading = true

  setTimeout(()=>{
    globalStore.userActionDialogLoading = false
  }, 1500)
}


</script>

<template>
  <div class="right-content">
    <!-- Title -->
    <div class="page-header">
      <h1 class="main-title">{{  pageContent.title }}</h1>
      <p class="page-description">{{  pageContent.description }}</p>
    </div>

    <!-- User Action Cards -->
    <div class="cards-container">
      <div class="user-action-card"
           role="button"
           tabindex="0"
           :class="[{'danger': card.isDanger === true}, cardIconColorClass(card.isDanger === true)]"
           v-for="(card, index) in pageContent.actions"
           :key="index"
           @click="openActionDialog"
           @keydown.enter="openActionDialog"
           @keydown.space.prevent="openActionDialog">
        <div class="card-header">
          <h3 class="card-title">{{ card.title }}</h3>
          <div class="card-icon">
            <Component :is="card.icon"/>
          </div>
        </div>
        <div class="card-content">
          <p>{{ card.text_line1 }}</p>
          <p>{{ card.text_line2 }}</p>
          <p>{{ card.text_line3 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Right Content */
.right-content {
  width: 41.875rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.main-title {
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.25rem;
  white-space: nowrap;
  letter-spacing: 0.035rem;

  color: var(--jus-color-global-neutrals-text-primary);
  font-style: normal;
}

.page-description {
  font-weight: 400;
  font-size: 0.875rem;
  white-space: wrap;

  color: var(--jus-color-global-neutrals-text-primary);
  font-style: normal;
  line-height: normal;
  margin-top: 0.94rem;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  width: 41.875rem;
  gap: 1.25rem;

  margin-top: 2.69rem;
  padding-bottom: 1rem;

}

.user-action-card {
  cursor: pointer;
  display: flex;
  width: 19.6875rem;
  height: 8.125rem;
  padding: 0.625rem 1.25rem;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
  aspect-ratio: 63/26;

  border-radius: 0.75rem;
  border: 0.05rem solid var(--jus-color-global-neutrals-text-secondary);

  /* Default Shadow */
  box-shadow: 0 2px 6px 0 var(--jus-color-global-neutrals-text-primary);
}

[data-theme="light"] .user-action-card.danger {

  background: linear-gradient(
      99deg,
      rgba(216, 30, 6, 0.18) 1.55%, rgba(216, 30, 6, 0.05) 97.74%
  ),
  linear-gradient(99deg, rgba(255, 255, 255, 0.45) 1.55%, #F5F5F5 97.74%);
  box-shadow: 0 2px 6px 0 #FA4A33;
}

.user-action-card.danger {
  border: 0.1rem solid #C91900; /*#DB3832;*/
}

.user-action-card.danger.cn {
  border: 0.1rem solid var(--jus-color-global-cn-red);
}

.user-action-card.danger.jp {
  border: 0.1rem solid var(--jus-color-global-jp-red);
}

.user-action-card.danger.kr {
  border: 0.1rem solid var(--jus-color-global-kr-red);
}

.user-action-card.danger.us {
  border: 0.1rem solid var(--jus-color-global-us-red);
}

.defaultRed svg {
  color: #C92000;
}

.cn svg {
  color: var(--jus-color-global-cn-red);
}

.jp svg {
  color: var(--jus-color-global-jp-red);
}

.kr svg {
  color: var(--jus-color-global-kr-red);
}

.us svg {
  color: var(--jus-color-global-us-red);
}

[data-theme="dark"] .user-action-card.danger {
  border: 0.1rem solid #D81E06;
  background: linear-gradient(
      99deg,
      rgba(216, 30, 6, 0.18) 1.55%, rgba(216, 30, 6, 0.05) 97.74%
  ),
  linear-gradient(99deg, #F5F5F5 1.55%, rgba(255, 255, 255, 0.45) 97.74%);
  box-shadow: 0 2px 6px 0 #FA4A33;
}

[data-theme="light"] .user-action-card {
  background: linear-gradient(99deg, rgba(255, 255, 255, 0.45) 1.55%, #F5F5F5 97.74%);
}

[data-theme="dark"] .user-action-card {
  background: linear-gradient(99deg, #F5F5F5 1.55%, rgba(255, 255, 255, 0.45) 97.74%);
}

.card-header {
  display: flex;
  height: 2.5rem;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  align-self: stretch;
}

.card-title {
  font-family: 'PingFang SC', sans-serif;
  color: #212121;;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2.5rem; /* 200% */
  letter-spacing: -0.05rem;
}

.card-icon {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  aspect-ratio: 1/1;

  color: var(--jus-color-global-icon-blue);
}

.card-icon svg {
  width: 1.35rem;
  height: 1.35rem;
}

.card-icon img {
  width: 1.35rem;
  height: 1.35rem;
}

.card-content {
  display: flex;
  width: 100%;
  height: 3.875rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.card-content p {
  display: flex;
  flex-direction: column;
  justify-content: start;
  flex: 1 0 0;
  align-self: stretch;

  color: #212121;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  /* 控制文本靠左 */
  text-align: left;
}
</style>