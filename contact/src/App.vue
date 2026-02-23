<script setup lang="ts">
import MainContent from "./components/MainContent.vue"
import GradualBlur from "./components/GradualBlur/GradualBlur.vue";
import ColorBends from "./components/ColorBends/ColorBends.vue";
import {computed, onMounted, onBeforeUnmount, ref} from "vue";
import {useI18n} from "vue-i18n";

const {locale} = useI18n()
// default language: zh
const systemLanguage = ref('zh');
const updateSystemLanguage = (customizedLanguage: string | null) => {
  if (customizedLanguage === null) {
    const lang = navigator.language || (navigator as any).userLanguage || 'zh';
    systemLanguage.value = lang.split('-')[0].toLowerCase();
  } else {
    systemLanguage.value = customizedLanguage;
  }
  locale.value = systemLanguage.value;
};


const screenWidth = ref(window.innerWidth);

const isScrollbar = computed(() => {
  return screenWidth.value >= 1024;
});

// 更新屏幕宽度
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  console.info(
      "%c Contact - Jian Unified System %c v" + "0.2.0",
      "padding: 2px 6px; border-radius: 3px 0 0 3px; color: #fff; background: #FF6699; font-weight: bold;",
      "padding: 2px 6px; border-radius: 0 3px 3px 0; color: #fff; background: #FF9999; font-weight: bold;"
  );
  window.addEventListener('resize', updateScreenWidth);
  updateSystemLanguage(null);
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