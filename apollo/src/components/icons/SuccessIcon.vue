<template>
  <div class="success-icon">
    <div class="icon-container">
      <div class="checkmark-circle">
        <div class="checkmark-path"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 成功图标组件
</script>

<style scoped>
.success-icon {
  @apply relative w-full h-full;
}

.icon-container {
  @apply relative w-full h-full;
}

.checkmark-circle {
  @apply absolute inset-2 rounded-full bg-green-500 flex items-center justify-center;
}

.checkmark-path {
  @apply w-3 h-3 relative;
}

.checkmark-path::before {
  content: '';
  @apply absolute w-1 h-2 bg-white transform rotate-45;
  left: 6px;
  top: 2px;
}

.checkmark-path::after {
  content: '';
  @apply absolute w-1 h-1 bg-white transform -rotate-45;
  left: 4px;
  top: 4px;
}
</style>
