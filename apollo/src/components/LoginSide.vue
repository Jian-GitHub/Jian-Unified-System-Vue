<script setup>
const emit = defineEmits(['switch'])

// Figma assets
const CIRCLE_TOP = 'http://localhost:3845/assets/1f8cbec1293c1ab43e850482e04209a70286b0bc.svg'
const CIRCLE_BOTTOM = 'http://localhost:3845/assets/d12e4329d2090de7573d1f8cdcbaefeef1b3fb0f.svg'

function handleClick() {
  emit('switch')
}
</script>

<template>
  <div class="side" data-node-id="147:2563">
    <img class="circle circle--top" :src="CIRCLE_TOP" alt="" />
    <img class="circle circle--bottom" :src="CIRCLE_BOTTOM" alt="" />

    <div class="brand">Jian Unified System</div>
    <div class="promo">还没有账号吗？<br/>现在注册，即刻启程！</div>

    <button class="sideToButton" type="button" @click="handleClick">
      前往注册
    </button>
  </div>
</template>

<style scoped lang="css">
@import '../assets/colors/themes/light.css';

.side {
  position: relative;
  width: 400px;
  height: 700px;
  background: var(--color-bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: "PingFang SC", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.circle {
  position: absolute;
  pointer-events: none;
}
.circle--top {
  width: 300px;
  height: 300px;
  left: calc(50% + 214px);
  top: calc(50% - 410px);
  transform: translate(-50%, -50%);
}
.circle--bottom {
  width: 500px;
  height: 500px;
  left: calc(50% - 192px);
  top: calc(50% + 452px);
  transform: translate(-50%, -50%);
}

.brand {
  font-weight: 600;
  font-size: 32px;
  color: #212121;
}

.promo {
  color: #212121;
  font-size: 16px;
  text-align: center;
  line-height: 30px;
}

.sideToButton {
  width: 180px;
  height: 50px;
  border-radius: 8px;
  background: #fafafa;
  box-shadow: 0 4px 4px rgba(0,0,0,0.25);
  border: none;
  font-size: 20px;
  color: #212121;
  letter-spacing: 3px;
  cursor: pointer;
}
</style>


