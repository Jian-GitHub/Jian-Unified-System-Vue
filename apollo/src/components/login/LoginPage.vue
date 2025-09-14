<script setup lang="ts">
import Side from "@/components/login/side/Side.vue";
import Container from "@/components/login/container/Container.vue";
import {ref} from "vue";

const isLogin = ref(true)
const isWaitingForServer = ref(false)
</script>

<template>
  <div class="jus-apollo-login-page">
    <div class="jus-apollo-login-panel">
      <div class="jus-apollo-login" v-loading="isWaitingForServer" element-loading-background="var(--jus-color-icarus-primary-200)">
        <Side v-model:is-login="isLogin" :class="['jus-apollo-login-side',{ 'move-right': !isLogin }]"/>
        <Container v-model:is-waiting-for-server="isWaitingForServer" :class="['jus-apollo-login-container', { 'move-left': !isLogin }]"/>
      </div>
    </div>

  </div>
</template>

<style>
.jus-apollo-login .el-loading-mask:not(.cloudflare-checker-loading) {
  opacity: 0.7;
}
.jus-apollo-login .el-loading-spinner:not(.cloudflare-checker-loading) .path {
  stroke: #F4BEBD;
  stroke-width: 3;
}
.jus-apollo-login .el-loading-spinner:not(.cloudflare-checker-loading) svg {
  stroke: #F4BEBD;
  stroke-width: 5;
  width: 10rem;
  height: 10rem;
  filter: drop-shadow(0 0px 6px var(--jus-color-global-neutrals-text-primary));
}

</style>
<style scoped>
.jus-apollo-login-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
  min-width: 980px;
  min-height: 625px;
  overflow: auto;

  /*
  background: linear-gradient(115deg, var(--jus-color-doraemon-surface, #F5F5F5) 21.73%, var(--jus-color-doraemon-primary-200, #E3F2FD) 116.53%);

   */
}


.jus-apollo-login-panel {

  display: flex;
  justify-content: center;
  align-items: center;
}

.jus-apollo-login {
  overflow: hidden;
  display: flex;
  width: 62.5rem;
  height: 43.75rem;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  border-radius: 0.75rem;
  background: linear-gradient(122deg, var(--jus-color-icarus-primary-200, #F9E8E7) 13.11%, var(--jus-color-icarus-primary-300, #F4BEBD) 155.91%);
  box-shadow: 10px 10px 10px 0 var(--jus-color-global-shadow-bottom-right, #F9F9F9), -10px -10px 10px 0 var(--jus-color-global-shadow-top-left, #D1D9E6);


  position: relative;
}

.jus-apollo-login-side {
  z-index: 1;
  transition: all 10s ease-in-out;
}

.jus-apollo-login-container {
  z-index: 0;
  transition: all 10s ease-in-out 1s;
}

/* 子元素宽度固定 */
.jus-apollo-login > * {
  transition: all 1.5s ease;
}

/* 默认布局：LeftSide 左，UserContainer 右 */
.move-left {
  transform: translateX(0);
}

.move-right {
  transform: translateX(0);
}

/* 切换状态时平移动画 */
.jus-apollo-login > .move-right {
  transform: translateX(37.5rem); /* LeftSide 向右移动 UserContainer 宽度 */
}

.jus-apollo-login > .move-left {
  transform: translateX(-25rem); /* UserContainer 向左移动 LeftSide 宽度 */
}
</style>