<template>
  <div class="cloudflare-logo-text">
    <div class="logo-container">
      <div class="logo-icon">
        <img src="/src/assets/logo/cloudflare_20x20.svg" alt="Cloudflare Logo" />
      </div>
      <div class="logo-text">
        <img src="/src/assets/logo/cloudflare_logo_text.svg" alt="Cloudflare" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Cloudflare Logo + Text 组件
</script>

<style scoped>
.cloudflare-logo-text {
  @apply relative w-full h-full;
}

.logo-container {
  @apply relative w-full h-full flex items-center;
}

.logo-icon {
  @apply w-4 h-4 mr-1 flex items-center justify-center;
}

.logo-icon img {
  @apply w-full h-full;
}

.logo-text {
  @apply flex-1 flex items-center;
}

.logo-text img {
  @apply w-full h-auto;
}
</style>
