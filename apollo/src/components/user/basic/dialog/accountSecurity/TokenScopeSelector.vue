<script setup lang="ts">
import {type Component, computed, ComputedRef} from "vue";
import {useI18n} from "vue-i18n";
const {t} = useI18n()

defineProps<{
  modelValue: number[],
  options: {
    id: number;
    icon: Component;
    label: string;
  }[],
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const handleUpdate = (value: number[]): void => {
  emit('update:modelValue', value)
}

const placeholderText: ComputedRef<string> = computed(()=>{
  return t('security_page.actions.security.generate.selectorPlaceholder');
})
</script>

<template>
  <el-select
      :model-value="modelValue"
      @update:modelValue="handleUpdate"
      class="select-scope"
      multiple
      :placeholder="placeholderText"
      collapse-tags
      collapse-tags-tooltip
      clearable
      style="width: 10rem;max-height: 3.5rem">
    <el-option
        v-for="option in options"
        :key="option.id"
        :label="option.label"
        :value="option.id">
      <div class="flex items-center" style="display: flex; align-items: center;color: var(--jus-color-global-neutrals-text-primary);">
        <component :is="option.icon" style="width: 25px;height: 25px;margin-right: 8px"/>
        <span>{{ option.label }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<style>
.el-dialog .el-select-dropdown__item.is-hovering {
  background-color: var(--jus-color-global-neutrals-text-secondary);
}
.el-dialog .el-input .el-input__count .el-input__count-inner {
  background: transparent;
  color: var(--jus-color-global-neutrals-text-secondary);
}
.el-tag {
  background-color: var(--jus-color-icarus-surface) !important;
  border-color: var(--jus-color-global-neutrals-text-primary) !important;
  color: var(--jus-color-global-neutrals-text-primary) !important;
}
.el-dialog.jus-apollo-user-account-security-dialog-token-alias {
  width: 33.125rem;
  margin-top: 20.5rem;
  border-radius: 0.75rem;
  background: var(--jus-color-icarus-surface);
}

.el-dialog .el-dialog__title {
  color: var(--jus-color-global-neutrals-text-primary);
}

.el-dialog .el-select__selection .el-tag {
  color: var(--jus-color-global-neutrals-text-primary);
  background: var(--jus-color-icarus-surface);
  border: 1px solid var(--jus-color-global-neutrals-text-secondary);
}

.el-select-dropdown__list {
  background: var(--jus-color-icarus-surface);
}
.el-popper.is-light, .el-popper.is-light > .el-popper__arrow::before {
  background: var(--jus-color-icarus-surface) !important;
}

.el-select-dropdown__item.is-hovering  {
  background-color: var(--jus-color-global-neutrals-text-secondary) !important;
}

.el-dialog .el-select__wrapper {
  width: 17rem;
  height: 3.5rem;
  margin-left: 0;
  border-radius: 0.75rem;
  box-shadow: -2px -2px 4px 0 var(--jus-color-global-shadow-bottom-right) inset, 2px 2px 4px 0 var(--jus-color-global-shadow-top-left) inset;
  border: 1px solid var(--jus-color-global-neutrals-text-placeholder);
  background: var(--jus-color-icarus-surface);
}

.el-dialog .el-select__wrapper.is-hovering:not(.is-focused) {
  box-shadow: -4px -4px 4px 0 var(--jus-color-global-shadow-bottom-right) inset, 4px 4px 4px 0 var(--jus-color-global-shadow-top-left) inset;
  transition: 0.2s;

  border: 1px solid #4070D4;
}

.el-dialog .el-select__wrapper.is-focused.el-tooltip__trigger {
  transition: 0.2s;

  border: 1px solid #4070D4;
  box-shadow: -4px -4px 4px 0 var(--jus-color-global-shadow-bottom-right) inset,
  4px 4px 4px 0 var(--jus-color-global-shadow-top-left) inset,
  0 0 0 1px #4070D4;
}

.el-dialog .el-select__wrapper.is-hovering.el-tooltip__trigger:not(.is-focused) {
  background: var(--jus-color-icarus-surface);
  box-shadow: -4px -4px 4px 0 var(--jus-color-global-shadow-bottom-right) inset, 4px 4px 4px 0 var(--jus-color-global-shadow-top-left) inset;

}
</style>