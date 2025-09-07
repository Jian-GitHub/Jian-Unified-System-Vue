<template>
  <div
      class="icarus-shell-button"
      :class="{
      'disabled': disabled,
      'hover': isHovered && !disabled
    }"
      data-name="Status=Default"
      data-node-id="147:2007"
      @click="handleClick"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
  >
    <div class="button-content" data-node-id="147:2009">
      <span class="button-text">{{ text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  text?: string
  disabled?: boolean
  status?: 'Default' | 'Hover'
}

const props = withDefaults(defineProps<Props>(), {
  text: '登录',
  disabled: false,
  status: 'Default'
})

const emit = defineEmits<{
  'click': []
}>()

const isHovered = ref(false)

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.icarus-shell-button {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f4bebd;
  border-radius: 8px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.icarus-shell-button:hover {
  transform: scale(1.02);
  box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.3);
}

.icarus-shell-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #d1d5db;
}

.icarus-shell-button.disabled:hover {
  transform: none;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: relative;
  flex-shrink: 0;
}

.button-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: black;
  text-align: center;
  letter-spacing: 3px;
  line-height: 24px;
  white-space: nowrap;
  position: relative;
  flex-shrink: 0;
}

/* 悬停状态的特殊样式 */
.icarus-shell-button.hover {
  background: #f0a8a6;
}

/* 点击效果 */
.icarus-shell-button:active:not(.disabled) {
  transform: scale(0.98);
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
}
</style>
