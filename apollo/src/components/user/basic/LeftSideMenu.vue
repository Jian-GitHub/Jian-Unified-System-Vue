<script setup lang="ts">
import {computed, ComputedRef} from "vue";
import {useI18n} from "vue-i18n";
import {useGlobalStore} from "@/store"

const globalStore = useGlobalStore()
const {t} = useI18n()
const menu_user_info: ComputedRef<string> = computed(() => t('user_container.left_side.menu.user_info'))
const menu_security: ComputedRef<string> = computed(() => t('user_container.left_side.menu.security'))

const menuItems = [
  menu_user_info,
  menu_security
]
const clickMenuItem = (index: number) => {
  globalStore.userPageItemIndex = index;
}
</script>

<template>
  <div class="side-menu">
    <div v-for="(item, index) in menuItems"
         :key="index"
         :class="['menu-item', {'active': index === globalStore.userPageItemIndex}]"
         @click="clickMenuItem(index)">
      {{ item }}
    </div>
  </div>
</template>

<style scoped>
.side-menu {
  margin-top: 2.44rem;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.625rem;
}

.menu-item {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--jus-color-global-neutrals-text-primary);
  white-space: nowrap;
  cursor: pointer;

  font-style: normal;
  line-height: normal;
  letter-spacing: -0.0675rem;
}

.menu-item.active {
  color: var(--jus-color-global-icon-blue);
  font-size: 1.125rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.045rem;
}
</style>