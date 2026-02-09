<script setup>
import {ref} from "vue";
import {redirectToApp} from "../../assets/cardAction.ts";

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  qrCode: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})
let isHovered = ref(false);

function addClass() {
  const element = document.querySelector('.some-other-element');
  element.classList.add(colorClass);
}
function startHover() {
  // console.log('true')
  isHovered.value = true;
  // changeBackgroundColor(true)
}
function endHover() {
  // console.log('false')
  isHovered.value = false;
  // changeBackgroundColor(false)
}
//
// watch(isHovered, (newValue, oldValue) => {
//   console.log('change',newValue)
//   changeBackgroundColor(newValue)
// })
// function changeBackgroundColor(onHover) {
//   // console.log("aaa")
//   const cardTitle = document.querySelector('.card h2');
//   cardTitle.style.background = onHover ? props.color : 'transparent';
// }
</script>

<template>
  <div class="cardPanel" @click="redirectToApp(name)">
    <div class="container">
      <div class="card" @touchstart="startHover" @touchend="endHover">
        <div class="img-box" style="z-index: 2">
          <img alt="app icon" :src="icon">
        </div>
<!--        <el-image class="qrCode" style="display: flex;justify-content: center;align-items: center;flex-direction: column;z-index: 1; object-fit: cover; width: 150px; height: 150px;  opacity: 0;transition: transform 0.5s, opacity 0.5s;" :src="qrCode" fit="contain" />-->
        <img alt="QR Code" class="qrCode" :src="qrCode" style="text-align: center;line-height: 240px;vertical-align: middle;object-fit: cover;position: absolute; width: 120px; height: 120px; max-width: 250px; max-height: 250px; opacity: 0;transition: transform 0.5s, opacity 0.5s;">
        <h2 :class="name">{{ name }}</h2>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
