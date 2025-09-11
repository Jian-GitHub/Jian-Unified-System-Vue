<script setup lang="ts">
import {computed} from 'vue'
import ArrowDown from "@/assets/icon/arrow_drop_down_20x20.svg";
import DayNightToggleButton from "@/components/dayNightToggleButton/DayNightToggleButton.vue";
import Translate from "@/assets/icon/translate_20x20.svg";
import {useGlobalStore} from "@/store";
import {useI18n} from "vue-i18n";

const {t, locale} = useI18n()
const globalStore = useGlobalStore()

const switchLanguage = (lang: string): void => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

const queryLanguageText = (langCode: string): string => {
  return t('languages.' + langCode);
};
const nowLanguage = computed(()=> locale.value);

</script>

<template>
  <div class="jus-apollo-login-settings" style="">
    <DayNightToggleButton style="font-size: 0.025rem;"/>
    <div class="jus-apollo-login-setting-language-switch">
      <el-dropdown  trigger="click" @command="switchLanguage">
          <span class="el-dropdown-link">
            <Translate class="jus-apollo-login-setting-language-switch-icon"/>
            <ArrowDown class="jus-apollo-login-setting-language-switch-icon arrow-down"/>
          </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
                v-for="(value, index) in globalStore.languages"
                :key="index"
                :disabled="nowLanguage == value"
                :command="value">
              {{ queryLanguageText(value) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>

.jus-apollo-login-settings {
  top: 0;
  right: 0;
  position: absolute;
  z-index: 1;
  color: var(--jus-color-global-neutrals-text-primary);
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  height: 3.5rem;
  padding: 0 0 0 1.25rem;

  border-radius: 0 0 0 1.5625rem;
  background: linear-gradient(95deg, rgba(138, 188, 250, 0.05) 16.49%, rgba(82, 111, 148, 0.08) 97.23%);
  box-shadow: 0 -4px 4px 0 var(--jus-color-global-shadow-top-left) inset, 4px 4px 4px 0 var(--jus-color-global-shadow-bottom-right) inset;
}

.jus-apollo-login-setting-language-switch {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  will-change: filter;
}

.jus-apollo-login-setting-language-switch:hover {
  transition: all 0.3s ease-out;
  filter: drop-shadow(0px 2px 6px var(--jus-color-global-neutrals-text-secondary));
}
/*
el-dropdown-link el-tooltip__trigger el-tooltip__trigger
 */
:deep(.el-dropdown) {
  border: none;
}

.el-dropdown-link {
  border: none;
  outline: none;
}

.jus-apollo-login-setting-language-switch-icon {
  width: 1.6rem;
  height: 1.6rem;
  color: var(--jus-color-global-neutrals-text-primary);
}

.jus-apollo-login-setting-language-switch-icon.arrow-down {
  position: relative;
  left: -0.5rem;
}
</style>