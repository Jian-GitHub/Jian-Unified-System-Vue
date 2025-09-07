<script setup lang="ts">
import { computed } from 'vue'
import Side from "@/components/login/side/Side.vue";
import Container from "@/components/login/container/Container.vue";
import {store} from "@/store";
const {isLogin} = store()

const className = computed(() => {
  // console.log("状态", isLogin.value)
  return isLogin.value ? '' : 'jus-apollo-login-register'
})

</script>

<template>
  <div class="jus-apollo-login-panel">
    <div class="jus-apollo-login">
      <Side :class="['jus-apollo-login-side',{ 'move-right': !isLogin }]"/>
      <Container :class="['jus-apollo-login-container', { 'move-left': !isLogin }]"/>
    </div>
  </div>
</template>

<style scoped>
.jus-apollo-login-panel {
  width: 100vw;
  height: 100vh;
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
}

/* 子元素宽度固定 */
.jus-apollo-login > * {
  transition: all 1.5s ease;
}

/* 默认布局：Side 左，Container 右 */
.move-left {
  transform: translateX(0);
}

.move-right {
  transform: translateX(0);
}

/* 切换状态时平移动画 */
.jus-apollo-login > .move-right {
  transform: translateX(37.5rem); /* Side 向右移动 Container 宽度 */
}

.jus-apollo-login > .move-left {
  transform: translateX(-25rem); /* Container 向左移动 Side 宽度 */
}
</style>