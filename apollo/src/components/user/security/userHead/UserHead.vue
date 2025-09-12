<script setup lang="ts">
import type {User} from "@/types/user"
import SearchIcon from "@/assets/icon/search_20x20.svg"
import HeadDivider from "@/assets/svg/head_divider.svg"
import {computed, ComputedRef} from "vue";
import ApolloLogoNormal from "@/components/user/basic/ApolloLogoNormal.vue";
import {useGlobalStore} from "@/store";

const globalStore = useGlobalStore()

import {useI18n} from "vue-i18n";

const {t, locale} = useI18n()

const title: ComputedRef<string> = computed(() => t('head.title'))
const logout: ComputedRef<string> = computed(() => t('head.logout'))

const menu_alfheim: ComputedRef<string> = computed(() => t('head.menu.alfheim'))
const menu_argus: ComputedRef<string> = computed(() => t('head.menu.argus'))
const menu_hermes: ComputedRef<string> = computed(() => t('head.menu.hermes'))

const user1: User = {
  id: '123',
  email: 'e.jianqi@gmail.com',
  info: {
    name: {
      givenName: '剑',
      middleName: '',
      familyName: '祁'
    },
    birthday: {
      year: '1999',
      month: '11',
      day: '06',
    },
    countryRegion: 'JP',
    language: 'ja',
  },
  security: {
    contacts: [
      '201824101323@hainnu.edu.cn',
      'jq71@students.waikato.ac.nz',
      'e.jianqi@gmail.com',
      'e_qijian@icloud.com',
    ],
    passwordUpdatedDate: {
      year: '2023',
      month: '06',
      day: '02',
    },
    accountSecurityTokenNum: 2,
    notificationEmail: 'e.jianqi@gmail.com',
    passkeysNum: 1,
    thirdPartyAccounts: {
      github: true,
      google: false,
    }
  }
}

function newUser() {
  user1.id = Math.random().toString()
  user1.security.contacts.push("A")
  return user1
}

function setUser() {
  globalStore.user = {...newUser()}
}

</script>

<template>
  <div class="jus-apollo-head">
    <div class="jus-apollo-header">
      <!-- Apollo Icon -->
      <div class="apple-icon">
        <ApolloLogoNormal/>
      </div>
      <!-- Navigation Menu -->
      <div class="jus-apollo-header-nav-items">
        <div class="jus-apollo-header-nav-item">{{ menu_alfheim }}</div>
        <div class="jus-apollo-header-nav-item">{{ menu_argus }}</div>
        <div class="jus-apollo-header-nav-item">{{ menu_hermes }}</div>
        <div class="jus-apollo-header-nav-item">
          <SearchIcon class="search-icon"/>
        </div>
      </div>
    </div>
    <!-- Title -->
    <div class="jus-apollo-head-title-section">
      <div class="jus-apollo-head-page-title">{{ title }}</div>
      <div :class="['jus-apollo-head-logout-button', {'jus-apollo-head-logout-button-ja': locale === 'ja'}]"
           @click="setUser()">
        {{ logout }}
      </div>
    </div>
    <!-- Divider -->
    <div class="jus-apollo-head-divider">
      <HeadDivider alt="jus-apollo-head-divider"/>
    </div>
  </div>
</template>

<style scoped>
/* Head */
.jus-apollo-head {
  z-index: 1;
  top: 0;
  margin: 0 auto;
  display: flex;
  width: 62.5rem;
  height: 6.125rem;
  padding: 0 0.625rem;
  flex-direction: column;
  align-items: center;

  border-radius: 0.75rem;

  /* Glass Blur */
  backdrop-filter: blur(5px);

  color: var(--jus-color-global-neutrals-text-primary);

  border: 1px solid transparent;
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

.apple-icon img {
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
  text-shadow: rgba(0, 0, 0, 0.25) 0 4px 8px;
  white-space: nowrap;
  letter-spacing: -0.08px;
}

.jus-apollo-head-logout-button {
  background: var(--jus-color-global-icon-blue);
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
  font-family: 'Inter', 'Noto Sans JP', 'Noto Sans SC', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: white;
  white-space: nowrap;
}

.jus-apollo-head-logout-button-ja {
  width: 5rem;
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
  width: 100%;
  background: var(--jus-color-global-neutrals-text-secondary);
}
</style>