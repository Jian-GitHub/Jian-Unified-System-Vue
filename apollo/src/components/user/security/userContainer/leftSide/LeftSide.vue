<script setup lang="ts">
// import DefaultAvatar from "@/assets/img/default_avatar.svg"
import DefaultAvatar from "@/assets/img/doraemon.JPG"
import LeftSideMenu from "@/components/user/basic/LeftSideMenu.vue";
import {computed, ComputedRef, Ref} from "vue"
import {inject} from 'vue'
import {useI18n} from "vue-i18n";
import {useGlobalStore} from "@/store";

const globalStore = useGlobalStore()

const {t} = useI18n()

// const username_data = "祁剑";
// const email_data = "e.jianqi@gmail.com";
const id: ComputedRef<string> = computed(() => {
  if (!globalStore.accountInfoShort) return '';
  return globalStore.accountInfoShort.id ? globalStore.accountInfoShort.id : '';
})
const name: ComputedRef<string> = computed(() => {
  const defaultName = t('user_container.left_side.username');
  if (!globalStore.accountInfoShort) return defaultName
  return globalStore.accountInfoShort.name
})

const avatar: ComputedRef<string> = computed(() => {
  if (globalStore.user.avatar) return globalStore.user.avatar;
  return DefaultAvatar;
})
// const email: ComputedRef<string> = computed(() => {
//   if (!globalStore.accountInfoShort) return '';
//   return globalStore.accountInfoShort.email ? globalStore.accountInfoShort.email : '';
// })

const loading: ComputedRef<boolean> = computed(() => !(globalStore.accountInfoShort && globalStore.accountInfoShort.id))
</script>

<template>
  <div class="left-side">

    <!-- 用户信息 -->
    <el-skeleton :loading="loading"
                 animated
                 :throttle="{ leading: 500, trailing: 500, initVal: true }">
      <template #template>
        <!-- 用户头像 -->
        <div class="avatar-section">
          <div class="avatar">
            <el-skeleton-item variant="image" style="width: 100%; height: 100%"/>
          </div>
        </div>
        <div class="user-info">
          <el-skeleton-item class="skeleton-user-name" variant="h3"/>
          <el-skeleton-item class="skeleton-user-email" variant="h3"/>
        </div>
      </template>
      <template #default>
        <!-- 用户头像 -->
        <div class="avatar-section">
          <div class="avatar">
            <img :src="avatar" alt="default avatar">/>
          </div>
        </div>
        <div class="user-info">
          <div class="user-name">{{ name }}</div>
          <div class="user-email">{{ id }}</div>
        </div>
      </template>
    </el-skeleton>

    <!-- 侧边菜单 -->
    <LeftSideMenu/>
  </div>
</template>

<style scoped>
/* 左侧边栏 */
.left-side {
  display: flex;
  flex-direction: column;
  width: 7.8125rem;
  flex-shrink: 0;
  margin-bottom: 3rem;
}
.skeleton-user-name {
  margin-top: 0.2rem;
  width: 50%;
  height: 1.45rem;
}
.skeleton-user-email {
  margin-top: 0.13rem;
  height: 1.2rem;
}

.avatar-section {
  width: 5rem;
  height: 5rem;
}

.avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 5rem;
  height: 5rem;
}

[data-theme="dark"] .avatar {
  box-shadow: 0 2px 6px 0 whitesmoke;
}


.user-info {
  margin-top: 0.8rem;
  left: 0;

  display: flex;
  flex-direction: column;
  width: 7.8125rem;
  flex-shrink: 0;
  gap: 0.13rem;
}

.user-name {
  font-weight: 500;
  font-size: 1.25rem;
  line-height: 1.75rem;
  white-space: nowrap;

  color: var(--jus-color-global-neutrals-text-primary);

  /* Web/H4 */
  font-style: normal;
  letter-spacing: -0.005rem;
}

.user-email {
  font-weight: 400;
  font-size: 0.875rem;
  white-space: nowrap;

  color: var(--jus-color-global-neutrals-text-secondary);
  font-style: normal;
  line-height: normal;
}


</style>