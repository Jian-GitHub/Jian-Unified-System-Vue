<template>
  <img :src="src" :alt="alt" />
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  src: { type: String as PropType<string>, required: true },
  alt: { type: String, default: '' },
})
</script>