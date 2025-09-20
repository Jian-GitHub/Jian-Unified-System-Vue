<script setup lang="ts">
import ApolloLogoBlue from "@/assets/logo/apollo_blue.png";
import PngIcon from "@/components/PngIcon.vue";
import {useSessionStore} from "@/store";

const globalStore = useSessionStore()
</script>

<template>
  <PngIcon :src="ApolloLogoBlue"/>
</template>

<style scoped>

</style>