<script setup lang="ts">

</script>

<template>
  <div class="side-menu">
    <div class="menu-item">个人信息</div>
    <div class="menu-item active">登录和安全</div>
  </div>
</template>

<style scoped>
.side-menu {
  margin-top:  2.44rem;
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
  color: #4070d4;

  font-size: 1.125rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.045rem;
}
</style>