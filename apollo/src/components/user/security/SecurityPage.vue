<template>
  <div class="jus-apollo-user-security-page">
    <!-- 主容器 -->
    <!-- 头部区域 -->
    <UserHead/>

    <!-- 内容区域 -->
    <UserContainer class="jus-apollo-user-page-container-component"/>
  </div>
</template>

<script setup lang="ts">
import UserHead from "@/components/user/security/userHead/UserHead.vue";
import UserContainer from "@/components/user/security/userContainer/UserContainer.vue";
</script>

<style scoped>
.jus-apollo-user-security-page {

  position: absolute;
  height: 100vh;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 62.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  align-self: stretch;
}
</style>
