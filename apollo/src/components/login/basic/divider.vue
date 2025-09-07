<script setup lang="ts">
defineProps<{
  text: string
}>();
</script>

<template>
  <div class="custom-divider">
    <span class="line"></span>
    <span class="text" style="background-color: transparent;">{{ text }}</span>
    <span class="line"></span>
  </div>
</template>

<style scoped>
.custom-divider {
  display: flex;
  align-items: center;      /* 文字垂直居中 */
  text-align: center;
  width: 100%;              /* 可根据需要调整 */
}

.custom-divider .line {
  flex: 1;                  /* 让线占满两侧空间 */
  margin-top: 0.2rem;
  height: 0.0625rem;              /* 线条粗细 */
  background-color: #c0c4cc; /* 线条颜色 */

  background: var(--jus-color-global-neutrals-text-placeholder);
}

.custom-divider .text {
  padding: 0 10px;          /* 文字两侧空隙，形成“断开”效果 */
  white-space: nowrap;       /* 防止文字换行 */
  background-color: transparent;    /* 背景色覆盖线条，实现视觉断开 */

  color: var(--jus-color-global-neutrals-text-primary);
  text-align: center;
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5rem; /* 150% */
  letter-spacing: -0.07rem;
}

</style>