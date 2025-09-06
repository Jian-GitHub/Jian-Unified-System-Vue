<template>
  <div class="circle"></div>
</template>

<style scoped>
.circle {
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.0); /* fill-opacity="0.01" */
  /* 双向内阴影：右下亮色，左上亮色 */
  box-shadow:
      inset 8px 8px 6px var(--jus-color-global-circle-shadow),   /* 对应 dx=8 dy=8 偏移 */
      inset -8px -8px 6px var(--jus-color-doraemon-background); /* 对应 dx=-8 dy=-8 偏移 */
}
</style>