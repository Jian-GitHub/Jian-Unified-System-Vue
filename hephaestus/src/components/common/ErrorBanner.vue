<script setup lang="ts">
defineProps<{ message?: string | null }>()
</script>

<template>
  <div v-if="message" class="heph-error" role="alert">
    {{ message }}
  </div>
</template>
