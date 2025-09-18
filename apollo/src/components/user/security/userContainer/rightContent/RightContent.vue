<script setup lang="ts">
import UserActionCard from "@/components/user/security/userContainer/rightContent/UserActionCard.vue";
// import { useRouter } from 'vue-router';
// const router = useRouter();
import {useI18n} from "vue-i18n";
const {locale} = useI18n()

import {useGlobalStore} from "@/store";
import {UserPageContent} from "@/types/UserPage";
import {onMounted} from "vue";
import {GetUserInfo, GetUserSecurityInfo, UserInfoResponseData, UserSecurityInfoResponseData} from "@/api/AccountActions";
import {AxiosResponse} from "axios";

const store = useGlobalStore();

defineProps<{
  pageContent: UserPageContent
}>()

function loadUserSecurityInfo(resp: AxiosResponse<UserSecurityInfoResponseData>) {
  if (resp.status != 200 || resp.data.code != 200) return;
  const securityInfo = resp.data.data;
  // Security
  let i = 0;
  // Contacts
  store.user.security.contacts = securityInfo.contacts;
  store.setActionCardStatus(1, store.actionsIds.securityActions[i++], false);
  // Password
  store.user.security.passwordUpdatedDate.year = securityInfo.passwordUpdatedDate.year;
  store.user.security.passwordUpdatedDate.month = securityInfo.passwordUpdatedDate.month;
  store.user.security.passwordUpdatedDate.day = securityInfo.passwordUpdatedDate.day;
  store.setActionCardStatus(1, store.actionsIds.securityActions[i++], false);
  // Account Security
  store.user.security.accountSecurityTokenNum = securityInfo.accountSecurityTokenNum;
  store.setActionCardStatus(1, store.actionsIds.securityActions[i++], false);
  // Skip Notification Email
  i++;
  // Passkeys
  store.user.security.passkeysNum = securityInfo.passkeysNum;
  store.setActionCardStatus(1, store.actionsIds.securityActions[i++], false);
  // Third-party Accounts
  store.user.security.thirdPartyAccounts = securityInfo.thirdPartyAccounts;
  store.setActionCardStatus(1, store.actionsIds.securityActions[i++], false);
}

function loadUserInfo(resp: AxiosResponse<UserInfoResponseData>) {
  if (resp.status != 200 || resp.data.code != 200) return;
  const userInfo = resp.data.data;
  store.user.id = userInfo.id;
  store.user.avatar = userInfo.avatar;

  // Info
  let i = 0;
  // name
  store.user.info.name.givenName = userInfo.given_name
  store.user.info.name.middleName = userInfo.middle_name
  store.user.info.name.familyName = userInfo.family_name
  store.setActionCardStatus(0, store.actionsIds.infoActions[i++], false)

  // birthday
  store.user.info.birthday.year = userInfo.birthday_year;
  store.user.info.birthday.month = userInfo.birthday_month;
  store.user.info.birthday.day = userInfo.birthday_day;
  store.setActionCardStatus(0, store.actionsIds.infoActions[i++], false)

  // country or region
  store.user.info.locale = userInfo.locate;
  store.setActionCardStatus(0, store.actionsIds.infoActions[i++], false)

  // language
  if (userInfo.language) {
    store.user.info.language = userInfo.language.split('-')[0];
    store.language = store.user.info.language
    locale.value = store.user.info.language
  } else store.user.info.language = '';
  store.setActionCardStatus(0, store.actionsIds.infoActions[i++], false)

  // Security
  // notification email
  store.user.security.notificationEmail = userInfo.notification_email;
  store.setActionCardStatus(1, store.actionsIds.securityActions[3], false)
}

onMounted(async () => {
  store.actionsIds.infoActions.forEach(id => {
    store.setActionCardStatus(0, id, true)
  })
  store.actionsIds.securityActions.forEach(id => {
    if (id === 206) return
    store.setActionCardStatus(1, id, true)
  })

  const [userInfo, securityInfo] = await Promise.allSettled([
    GetUserInfo(),
    GetUserSecurityInfo(),
  ])

  if (userInfo.status === 'fulfilled') {
    loadUserInfo(userInfo.value)
  }
  if (securityInfo.status === 'fulfilled') {
    loadUserSecurityInfo(securityInfo.value)
  }

})

</script>

<template>
  <div class="right-content">
    <!-- Title -->
    <div class="page-header">
      <h1 class="main-title">{{ pageContent.title }}</h1>
      <p class="page-description">{{ pageContent.description }}</p>
    </div>

    <!-- User Action Cards -->
    <div class="cards-container">
      <UserActionCard
          v-for="cardAction in pageContent.actions"
          :card="cardAction"
          :loading="cardAction.isFetching"/>
    </div>
  </div>
</template>

<style scoped>
/* Right Content */
.right-content {
  width: 41.875rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.main-title {
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.25rem;
  white-space: nowrap;
  letter-spacing: 0.035rem;

  color: var(--jus-color-global-neutrals-text-primary);
  font-style: normal;
}

.page-description {
  font-weight: 400;
  font-size: 0.875rem;
  white-space: wrap;

  color: var(--jus-color-global-neutrals-text-primary);
  font-style: normal;
  line-height: normal;
  margin-top: 0.94rem;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  width: 41.875rem;
  gap: 1.25rem;

  margin-top: 2.69rem;
  padding-bottom: 1rem;

}


</style>