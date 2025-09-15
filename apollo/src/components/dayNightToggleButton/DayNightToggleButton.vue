<script setup lang="ts">
import {logic} from "@/assets/logic/day-night-toggle-button";

const {toggle, clouds, stars} = logic();
</script>

<template>
  <div class="day-night-toggle-container">
    <div class="day-night-toggle-components" @click="toggle">
      <!-- moon -->
      <div class="day-night-toggle-main-button">
        <div v-for="n in 3" :key="'moon'+n" class="day-night-toggle-moon"></div>
      </div>

      <!-- background -->
      <div v-for="n in 3" :key="'bg'+n" class="day-night-toggle-daytime-background"></div>

      <!-- clouds -->
      <div v-for="c in clouds" :key="c" :class="'day-night-toggle-'+c">
        <div v-for="n in 6" :key="c+n" class="day-night-toggle-daytime-cloud-son"></div>
      </div>

      <!-- stars -->
      <div class="day-night-toggle-daytime-stars">
        <div v-for="(s,i) in stars" :key="i" :class="['day-night-toggle-daytime-star','day-night-toggle-daytime-'+s]">
          <div v-for="n in 4" :key="i+'-'+n" class="day-night-toggle-daytime-star-son"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/dayNightToggleButton.css";
</style>