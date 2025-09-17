<script setup lang="ts">
import LeftSide from "@/components/user/security/userContainer/leftSide/LeftSide.vue"
import RightContent from "@/components/user/security/userContainer/rightContent/RightContent.vue";

import {useGlobalStore} from "@/store"
import {computed, ComputedRef, ref, Ref} from "vue";
import {UserPageContent} from "@/types/UserPage";
import { provide } from "vue";

const globalStore = useGlobalStore()

const menuItemIndex: Ref<number> = ref(0);

function setMenuItemIndex(val: number) {
  menuItemIndex.value = val
}

const pageContent: ComputedRef<UserPageContent> = computed(() => {
  return menuItemIndex.value === 0 ? globalStore.infoPageContent : globalStore.securityPageContent
})
// onMounted(()=>{
//   alert("进入")
// })
// onBeforeUnmount(()=>{
//   alert("执行")
// })

provide('menuItemIndex', menuItemIndex)
provide('setMenuItemIndex', setMenuItemIndex)

const offsetTop = 9.75 * parseFloat(getComputedStyle(document.documentElement).fontSize);
</script>

<template>
  <div class="jus-apollo-user-container">
    <!-- 左侧边栏 -->
    <el-affix :offset="offsetTop" :z-index="0" target=".jus-apollo-user-container">
      <LeftSide class="jus-apollo-user-container-leftSide"/>
    </el-affix>

    <!-- 右侧内容区域 -->
<!--    <div class="jus-apollo-user-container-content" v-if="globalStore.userPageItemIndex === 0" style="color: var(&#45;&#45;jus-color-global-neutrals-text-primary)">Hello, World!</div>-->
    <RightContent class="jus-apollo-user-container-content" :page-content="pageContent"/>

  </div>
</template>

<style scoped>
/* 内容区域 */
.jus-apollo-user-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 3.625rem 1.25rem 2.25rem 1.25rem;
  width: 62.5rem;
  margin: 0 auto;
}

.jus-apollo-user-container-leftSide {
  top: calc(6.125rem + 3.625rem);
}
.jus-apollo-user-container-content {
  margin-top: 0;
}
</style>