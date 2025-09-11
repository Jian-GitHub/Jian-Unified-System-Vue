<script setup lang="ts">
import ApolloLogoBlue from "@/assets/logo/apollo_blue.png";
import PngIcon from "@/components/PngIcon.vue";
import {useGlobalStore} from "@/store";

const globalStore = useGlobalStore()
</script>

<template>
  <PngIcon :src="ApolloLogoBlue"/>
</template>

<style scoped>

</style>