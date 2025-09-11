<script setup lang="ts">
import ApolloLogoLightMode from "@/assets/logo/apollo_light.png"
import ApolloLogoDarkMode from "@/assets/logo/apollo_dark.png"
import PngIcon from "@/components/PngIcon.vue";
import {useGlobalStore} from "@/store";

const globalStore = useGlobalStore()
</script>

<template>
  <PngIcon :src="globalStore.theme === 'light' ? ApolloLogoLightMode: ApolloLogoDarkMode"/>
</template>

<style scoped>

</style>