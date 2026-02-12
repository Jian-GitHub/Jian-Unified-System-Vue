<script setup lang="ts">
import MainContent from "./components/MainContent.vue"
import GradualBlur from "./components/GradualBlur/GradualBlur.vue";
import ColorBends from "./components/ColorBends/ColorBends.vue";
</script>

<template>
  <div style="position: fixed; top: -10%; left: -10%; right: -10%; bottom: -10%; z-index: -1; overflow: hidden; width: 120vw; height: 120vh;">
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

  <section style="display: flex;height: 100vh; width: 100vw;">
      <!-- Content Here - such as an image or text -->
      <MainContent/>

    <GradualBlur
        target="parent"
        position="bottom"
        height="15vh"
        :strength="3"
        :divCount="5"
        curve="bezier"
        :exponential="true"
        :opacity="1"
    />
    <GradualBlur
        target="parent"
        position="top"
        height="15vh"
        :strength="3"
        :divCount="5"
        curve="bezier"
        :exponential="true"
        :opacity="1"
    />
  </section>
</template>