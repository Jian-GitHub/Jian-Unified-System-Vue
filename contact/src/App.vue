<script setup lang="ts">
import MainContent from "./components/MainContent.vue"
import GradualBlur from "./components/GradualBlur/GradualBlur.vue";
import ColorBends from "./components/ColorBends/ColorBends.vue";
import {computed, onMounted, onBeforeUnmount, ref} from "vue";

const screenWidth = ref(window.innerWidth);

const isScrollbar = computed(() => {
  return screenWidth.value >= 1024;
});

// 更新屏幕宽度
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenWidth);
});
</script>

<template>
  <div style="position: fixed; top: -10%; left: -10%; right: -10%; bottom: -10%; z-index: -1; overflow: hidden; width: 120vw; height: 120vh;background: var(--color-background-mute)">
    <ColorBends
        style="width: 100%; height: 100%;"
        :rotation="0"
        :auto-rotate="1"
        :speed="0.2"
        :scale="1"
        :frequency="1"
        :warpStrength="1"
        :mouseInfluence="1"
        :parallax="0.5"
        :noise="0.1"
        transparent
    />
  </div>

  <section class="main-content-container" style="width: 100vw;">
      <!-- Content Here - such as an image or text -->
      <MainContent/>

    <GradualBlur
        v-if="isScrollbar"
        target="parent"
        position="top"
        height="12vh"
        :strength="3"
        :divCount="5"
        curve="bezier"
        :exponential="true"
        :opacity="1"
    />
    <GradualBlur
        v-if="isScrollbar"
        target="parent"
        position="bottom"
        height="12vh"
        :strength="3"
        :divCount="5"
        curve="bezier"
        :exponential="true"
        :opacity="1"
    />
  </section>
</template>