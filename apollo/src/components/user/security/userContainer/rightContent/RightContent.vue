<script setup lang="ts">
import ApolloLogoBlue from "@/components/user/basic/ApolloLogoBlue.vue";
import PasswordIcon from "@/assets/icon/password_input_20x20.svg";
import SecurityIcon from "@/assets/icon/token_20x20.svg";
import EmailIcon from "@/assets/icon/email_20x20.svg";
import PasskeysIcon from "@/assets/logo/passkeys_outline_20x20.svg";
import ThirdPartyIcon from "@/assets/logo/github_20x20.svg";
import DeleteAccountIcon from "@/assets/icon/delete_account.svg"
import {computed, ComputedRef} from "vue"
import type {UserSecurityAction} from "@/store";

import {useI18n} from "vue-i18n";

const {t, locale} = useI18n()

import {useGlobalStore} from "@/store";

const globalStore = useGlobalStore()

const isUserNull = computed(() => globalStore.user == null || globalStore.user.security == null)

const contactsInfo = computed(() => {
  if (isUserNull.value || globalStore.user.security.contacts == null) return {line1: '', line2: '', line3: ''};
  const contactsNum = globalStore.user.security.contacts.length;
  switch (contactsNum) {
    case 0:
      return {line1: '', line2: '', line3: ''};
    case 1:
      return {line1: globalStore.user.security.contacts[0], line2: '', line3: ''};
    case 2:
      return {
        line1: globalStore.user.security.contacts[0],
        line2: globalStore.user.security.contacts[1],
        line3: ''
      };
    default:
      return {
        line1: globalStore.user.security.contacts[0],
        line2: globalStore.user.security.contacts[1],
        line3: t('user_container.right_content.actions.email_mobile.text_line3', {num: (contactsNum - 2)})
      };
  }
})

const passwordUpdatedInfo = computed(() => {
  if (isUserNull.value || !globalStore.user.security.passwordUpdatedDate) return '';
  return t('user_container.right_content.actions.password.text_line1', {
    year: globalStore.user.security.passwordUpdatedDate.year,
    month: globalStore.user.security.passwordUpdatedDate.month,
    day: globalStore.user.security.passwordUpdatedDate.day
  })
})

const tokenInfo = computed(() => {
  if (isUserNull.value || !globalStore.user.security.accountSecurityTokenNum) return '';
  return t('user_container.right_content.actions.security.text_line2', {num: globalStore.user.security.accountSecurityTokenNum})
})

const notificationEmail = computed(() => {
  if (isUserNull.value || !globalStore.user.security.notificationEmail) return '';
  return globalStore.user.security.notificationEmail;
})

const passkeysInfo = computed(() => {
  if (isUserNull.value || !globalStore.user.security.passkeysNum) return '';
  return t('user_container.right_content.actions.passkeys.text_line1', {num: globalStore.user.security.passkeysNum});
})

const thirdPartyAccountsInfo = computed(() => {
  if (isUserNull.value) return {line1: '', line2: ''};
  const boundText = t('user_container.right_content.actions.third_party_account.bound');
  const notBoundText = t('user_container.right_content.actions.third_party_account.not_bound');
  let line1Text = 'GitHub: '
  if (globalStore.user.security.thirdPartyAccounts.github)
    line1Text += globalStore.user.security.thirdPartyAccounts.github ? boundText : notBoundText;
  else
    line1Text += notBoundText;

  let line2Text = 'Google: '
  if (globalStore.user.security.thirdPartyAccounts.google)
    line2Text += globalStore.user.security.thirdPartyAccounts.google ? boundText : notBoundText;
  else
    line2Text += notBoundText;
  return {line1: line1Text, line2: line2Text};
})

const actionCards: ComputedRef<UserSecurityAction[]> = computed(() => [
  {
    id: 0,
    title: t('user_container.right_content.actions.email_mobile.title'),
    // icon: AppleLineLogo,
    icon: ApolloLogoBlue,
    text_line1: contactsInfo.value.line1,//'201824101323@hainnu.edu.cn',
    text_line2: contactsInfo.value.line2,
    text_line3: contactsInfo.value.line3
  },
  {
    id: 1,
    title: t('user_container.right_content.actions.password.title'),
    icon: PasswordIcon,
    text_line1: passwordUpdatedInfo.value
  },
  {
    id: 2,
    title: t('user_container.right_content.actions.security.title'),
    icon: SecurityIcon,
    text_line1: t('user_container.right_content.actions.security.text_line1'),
    text_line2: tokenInfo.value
  },
  {
    id: 3,
    title: t('user_container.right_content.actions.notification_email.title'),
    icon: EmailIcon,
    text_line1: notificationEmail.value,
  },
  {
    id: 4,
    title: t('user_container.right_content.actions.passkeys.title'),
    icon: PasskeysIcon,
    text_line1: passkeysInfo.value
  },
  {
    id: 5,
    title: t('user_container.right_content.actions.third_party_account.title'),
    icon: ThirdPartyIcon,
    text_line1: thirdPartyAccountsInfo.value.line1,
    text_line2: thirdPartyAccountsInfo.value.line2
  },
  {
    id: 6,
    title: t('user_container.right_content.actions.delete_account.title'),
    icon: DeleteAccountIcon,
    text_line1: t('user_container.right_content.actions.delete_account.text_line1')
  },
])

const contentTitle: ComputedRef<string> = computed(() => t('user_container.right_content.title'))
const contentDescription: ComputedRef<string> = computed(() => t('user_container.right_content.description'))

const cardIconColorClass = (cardId: number) => {
  if (cardId != 6) return '';
  switch (locale.value) {
    case 'zh':
      return 'cn';
    case 'ja':
      return 'jp';
    default:
      return 'defaultRedIcon';
  }
}
</script>

<template>
  <div class="right-content">
    <!-- Title -->
    <div class="page-header">
      <h1 class="main-title">{{ contentTitle }}</h1>
      <p class="page-description">{{ contentDescription }}</p>
    </div>

    <!-- Security Cards -->
    <div class="cards-container">
      <div class="security-card"
           role="button"
           tabindex="0"
           :class="[{'danger': card.id === 6}]"
           v-for="(card, index) in actionCards"
           :key="index"
           @click="globalStore.userPasskeysDialogVisible = true"
           @keydown.enter="globalStore.userPasskeysDialogVisible = true"
           @keydown.space.prevent="globalStore.userPasskeysDialogVisible = true">
        <div class="card-header">
          <h3 class="card-title">{{ card.title }}</h3>
          <div class="card-icon" :class="cardIconColorClass(card.id)">
            <Component :is="card.icon"/>
          </div>
        </div>
        <div class="card-content">
          <p>{{ card.text_line1 }}</p>
          <p>{{ card.text_line2 }}</p>
          <p>{{ card.text_line3 }}</p>
        </div>
      </div>
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

.security-card {
  cursor: pointer;
  display: flex;
  width: 19.6875rem;
  height: 8.125rem;
  padding: 0.625rem 1.25rem;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
  aspect-ratio: 63/26;

  border-radius: 0.75rem;
  border: 0.05rem solid var(--jus-color-global-neutrals-text-secondary);

  /* Default Shadow */
  box-shadow: 0 2px 6px 0 var(--jus-color-global-neutrals-text-primary);
}

[data-theme="light"] .security-card.danger {
  border: 0.1rem solid #DB3832;

  background: linear-gradient(
      99deg,
      rgba(216, 30, 6, 0.18) 1.55%, rgba(216, 30, 6, 0.05) 97.74%
  ),
  linear-gradient(99deg, rgba(255, 255, 255, 0.45) 1.55%, #F5F5F5 97.74%);
  box-shadow: 0 2px 6px 0 #FA4A33;
}

.defaultRedIcon svg {
  color: #C92000;
}

.cn svg {
  color: var(--jus-color-global-cn);
}

.jp svg {
  color: var(--jus-color-global-jp);
}

[data-theme="dark"] .security-card.danger {
  border: 0.1rem solid #D81E06;
  background: linear-gradient(
      99deg,
      rgba(216, 30, 6, 0.18) 1.55%, rgba(216, 30, 6, 0.05) 97.74%
  ),
  linear-gradient(99deg, #F5F5F5 1.55%, rgba(255, 255, 255, 0.45) 97.74%);
  box-shadow: 0 2px 6px 0 #FA4A33;
}

[data-theme="light"] .security-card {
  background: linear-gradient(99deg, rgba(255, 255, 255, 0.45) 1.55%, #F5F5F5 97.74%);
}

[data-theme="dark"] .security-card {
  background: linear-gradient(99deg, #F5F5F5 1.55%, rgba(255, 255, 255, 0.45) 97.74%);
}


.card-header {
  display: flex;
  height: 2.5rem;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  align-self: stretch;
}

.card-title {
  font-family: 'PingFang SC', sans-serif;
  color: #212121;;
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2.5rem; /* 200% */
  letter-spacing: -0.05rem;
}

.card-icon {

  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  aspect-ratio: 1/1;

  color: var(--jus-color-global-icon-blue);
}

.card-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.card-icon img {
  width: 1.25rem;
  height: 1.25rem;
}

.card-content {
  display: flex;
  width: 100%;
  height: 3.875rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.card-content p {
  display: flex;
  flex-direction: column;
  justify-content: start;
  flex: 1 0 0;
  align-self: stretch;

  color: #212121;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  /* 控制文本靠左 */
  text-align: left;
}
</style>