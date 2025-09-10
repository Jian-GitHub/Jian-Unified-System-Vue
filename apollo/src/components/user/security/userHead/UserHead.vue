<script setup lang="ts">
import AppleFillLogo from "@/assets/logo/apple_fill_20x20.svg"
import SearchIcon from "@/assets/icon/search_20x20.svg"
import HeadDivider from "@/assets/svg/head_divider.svg"
</script>

<template>
  <div class="jus-apollo-head">
    <div class="jus-apollo-header">
      <!-- Apple图标 -->
      <div class="apple-icon">
        <AppleFillLogo/>
      </div>
      <!-- 导航菜单 -->
      <div class="jus-apollo-header-nav-items">
        <div class="jus-apollo-header-nav-item">Alfheim</div>
        <div class="jus-apollo-header-nav-item">Argus</div>
        <div class="jus-apollo-header-nav-item">Hermes</div>
        <div class="jus-apollo-header-nav-item">
          <SearchIcon class="search-icon"/>
        </div>
      </div>
    </div>
    <!-- 标题区域 -->
    <div class="jus-apollo-head-title-section">
      <div class="jus-apollo-head-page-title">Apollo 账户</div>
      <div class="jus-apollo-head-logout-button">退出登录</div>
    </div>
    <!-- 分割线 -->
    <div class="jus-apollo-head-divider">
      <HeadDivider alt="jus-apollo-head-divider" />
    </div>
  </div>
</template>

<style scoped>
/* 头部区域 */
.jus-apollo-head {
  display: flex;
  width: 62.5rem;
  padding: 0 0.625rem;
  flex-direction: column;
  align-items: center;

  border-radius: 0.75rem;


  /* Glass Blur */
  backdrop-filter: blur(5px);

  color: var(--jus-color-global-neutrals-text-primary);

  border: 1px solid transparent;
  /* 边框的渐变 */
  /*
  background-clip: border-box, padding-box;

   */


}


.jus-apollo-header {
  height: 2.875rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0;
  opacity: 0.7;
  align-self: stretch;
}

.apple-icon svg {
  width: 1.35rem;
  height: 1.35rem;
  aspect-ratio: 1/1;
  margin-top: 0.15rem;
}


.jus-apollo-header-nav-items {
  display: flex;
  gap: 1.5625rem;
  align-items: center;
  justify-content: flex-end;
}

.jus-apollo-header-nav-item {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1rem;
  white-space: nowrap;

  text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);

  /* Web/Caption */
  font-style: normal;
  letter-spacing: 0.01275rem;
}

.search-icon {
  width: 1.35rem;
  height: 1.35rem;
  overflow: hidden;
  aspect-ratio: 1/1;
  margin-top: 0.15rem;
}

.jus-apollo-head-title-section {
  height: 2.9375rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  align-self: stretch;
}

.jus-apollo-head-page-title {
  font-weight: 500;
  font-size: 1.45rem;
  line-height: 1.75rem;
  text-shadow: rgba(0, 0, 0, 0.25) 0px 4px 8px;
  white-space: nowrap;
  letter-spacing: -0.08px;
}

.jus-apollo-head-logout-button {
  background: #4070d4;
  border-radius: 0.6875rem;
  padding: 0.25rem 0.6875rem;
  height: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  box-shadow: 0 0.125rem 0.5rem 0 rgba(0, 0, 0, 0.25);
  width: 4.475rem;
  cursor: pointer;
}

.jus-apollo-head-logout-button {
  font-family: 'Inter', 'Noto Sans JP', 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: white;
  white-space: nowrap;
}

.jus-apollo-head-divider {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-direction: column;
  align-self: stretch;

  height: 0.0625rem;
}

.jus-apollo-head-divider svg {
  height: 0.0625rem;
  background: var(--jus-color-global-neutrals-text-dividers, #E0E0E0);
}
</style>