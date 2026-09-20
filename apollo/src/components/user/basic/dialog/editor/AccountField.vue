<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  label: string
  type?: string
  autocomplete?: string
  required?: boolean
  maxlength?: number
}>(), { type: 'text', autocomplete: 'off', required: false, maxlength: 128 })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="account-field" :class="{ filled: modelValue }">
    <input :value="modelValue" :type="type" :autocomplete="autocomplete"
           :required="required" :maxlength="maxlength" placeholder=" "
           @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <span>{{ label }}</span>
  </label>
</template>

<style scoped>
.account-field { display: block; position: relative; width: 100%; }
input { box-sizing: border-box; width: 100%; height: 3.5rem; padding: 1.3rem 1rem .3rem; border: 1px solid var(--jus-color-global-neutrals-text-placeholder); border-radius: .75rem; background: var(--jus-color-icarus-surface); color: var(--jus-color-global-neutrals-text-primary); font: inherit; font-size: 1.0625rem; }
span { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--jus-color-global-neutrals-text-secondary); font-size: 1.0625rem; pointer-events: none; transition: all .15s; }
input:focus { outline: 2px solid var(--jus-color-global-icon-blue); outline-offset: 2px; border-color: var(--jus-color-global-icon-blue); }
input:focus + span, input:not(:placeholder-shown) + span { top: .4rem; transform: none; font-size: .75rem; }
@media (prefers-reduced-motion: reduce) { span { transition: none; } }
</style>
