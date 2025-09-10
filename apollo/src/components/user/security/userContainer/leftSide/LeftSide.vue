<script setup lang="ts">
// import DefaultAvatar from "@/assets/img/default_avatar.svg"
import DefaultAvatar from "@/assets/img/doraemon.JPG"
import LeftSideMenu from "@/components/user/basic/LeftSideMenu.vue";
</script>

<template>
  <div class="left-side">
    <!-- 用户头像 -->
    <div class="avatar-section">
      <div class="avatar">
        <img :src="DefaultAvatar" alt="default avatar">/>
<!--        <DefaultAvatar/>-->
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="user-info">
      <div class="user-name">祁剑</div>
      <div class="user-email">e.jianqi@gmail.com</div>
    </div>

    <!-- 侧边菜单 -->
    <LeftSideMenu/>
  </div>
</template>

<style scoped>
/* 左侧边栏 */
.left-side {
  /*
  display: grid;
  grid-template-columns: max-content;
  grid-template-rows: max-content;
  place-items: start;
  position: relative;

   */

  display: flex;
  flex-direction: column;
  width: 7.8125rem;
  flex-shrink: 0;
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
.avatar img{
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
  height: 3.125rem;
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