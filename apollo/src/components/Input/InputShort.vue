<template>
  <el-input class="input-short"
            :model-value="modelValue"
            @update:modelValue="handleUpdate"
            placeholder="Please input"/>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleUpdate = (value: string): void => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
@import "@/assets/css/input/InputShort.css";


</style>
