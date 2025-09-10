<script setup lang="ts">
import LeftSide from "@/components/user/security/userContainer/leftSide/LeftSide.vue"
import RightContent from "@/components/user/security/userContainer/rightContent/RightContent.vue";
</script>

<template>
  <div class="jus-apollo-user-container">
    <!-- 左侧边栏 -->
    <LeftSide class="jus-apollo-user-container-leftSide"/>

    <!-- 右侧内容区域 -->
    <RightContent class="jus-apollo-user-container-content"/>

  </div>
</template>

<style scoped>
/* 内容区域 */
.jus-apollo-user-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 3.625rem 1.25rem 0 1.25rem;
  width: 62.5rem;
}

.jus-apollo-user-container-content {
  margin-top: 0;
}
</style>