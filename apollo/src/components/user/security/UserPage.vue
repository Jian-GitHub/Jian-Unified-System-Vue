<template>
<!--  <div class="jus-apollo-user-security-page">-->
<!--  </div>-->
  <!-- 头部区域 -->
  <el-affix :offset="0" :z-index="1">
    <UserHead/>
  </el-affix>

  <!-- 内容区域 -->
<!--  <div class="content-wrapper">-->
  <UserContainer class="jus-apollo-user-page-container-component"/>
  <UserActionDialog/>
<!--  </div>-->
</template>

<script setup lang="ts">
import UserHead from "@/components/user/security/userHead/UserHead.vue";
import UserContainer from "@/components/user/security/userContainer/UserContainer.vue";
import UserActionDialog from "@/components/user/basic/UserActionDialog.vue";
</script>

<style scoped>
.jus-apollo-user-security-page {
  height: 100vh;
  width: 62.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  align-self: stretch;
}

.jus-apollo-user-page-container-component{
  padding-top: calc(3.625rem /* Padding Space */);;
}
/* 内容部分独立滚动 */
/*
.content-wrapper {
  overflow: visible;
}

 */
.as{
  padding-top: calc(6.125rem /* Head Height */ + 3.625rem /* Padding Space */);
}
</style>
