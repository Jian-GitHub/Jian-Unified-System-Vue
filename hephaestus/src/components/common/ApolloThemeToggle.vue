<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store/settings'

const { t } = useI18n()
const settings = useSettingsStore()
const clouds = ['daytime-cloud', 'daytime-cloud-light']
const stars = ['big', 'big', 'medium', 'medium', 'small', 'small']

const toggle = () => {
  const willChangeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', willChangeMode)
  settings.setTheme(willChangeMode)
}
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="t('settings.theme')" @click="toggle">
  <span class="day-night-toggle-container" aria-hidden="true">
    <div class="day-night-toggle-components">
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
  </span>
  </button>
</template>

<style scoped>
@import "@/assets/css/dayNightToggleButton.css";
.theme-toggle { display:grid; place-items:center; width:50px; height:36px; padding:0; border:0; border-radius:7px; background:transparent; cursor:pointer; }
.theme-toggle:focus-visible { outline:2px solid var(--heph-pine); outline-offset:2px; }
.day-night-toggle-container { font-size:.25px; }
</style>
