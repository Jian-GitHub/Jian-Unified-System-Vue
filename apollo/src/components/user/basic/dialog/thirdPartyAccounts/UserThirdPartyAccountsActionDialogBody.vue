<script setup lang="ts">
import {computed, ComputedRef, onMounted, Ref, ref, markRaw} from "vue";
import {useI18n} from "vue-i18n";
import {useSessionStore} from "@/store";

const {t} = useI18n()
const store = useSessionStore()

import {ThirdPartyBind, ThirdPartyContinue, ThirdPartyGetInfo, ThirdPartyRemove} from "@/api/AccountActions";
import {ThirdPartyProvider, ThirdPartyProviderLabel} from "@/types/thirdParty/ThirdParty";

const thirdPartyProviders: Ref<ThirdPartyProvider[]> = ref([])

onMounted(async () => {
  store.userActionDialogLoading = true
  try {
    const accounts = await ThirdPartyGetInfo();
    if (accounts.status != 200 || accounts.data.code != 200) {
      store.userActionDialogLoading = false
      return;
    }
    let flag = false;
    for (let provider of store.thirdPartyProviders) {
      for (let account of accounts.data.data.accounts) {
        if (account.provider === provider.label) {
          thirdPartyProviders.value.push({
            id: account.id,
            label: provider.label,
            icon: markRaw(provider.icon),
            isBound: true,
            boundText: provider.boundText,
            content: account.content,
            buttonText: t('user_action_dialog.third_party_accounts.content.buttonText.bound')
          })
          flag = true;
          // console.log('找到了',account.provider)
          break;
        }
      }
      if (flag) {
        flag = false;
        continue;
      }
      // console.log('没找到')
      thirdPartyProviders.value.push({
        label: provider.label,
        icon: markRaw(provider.icon),
        isBound: false,
        notBoundText: provider.notBoundText,
        content: '',
        buttonText: t('user_action_dialog.third_party_accounts.content.buttonText.not_bound')
      })
    }
  } catch (e) {
    console.log(e);
  }
  store.userActionDialogLoading = false;

  // console.log(thirdPartyProviders.value);
})
async function thirdPartyAccountAction(provider: ThirdPartyProvider) {
  if (provider.isBound) {
    // console.log("解除绑定")
    store.userActionDialogLoading = true;
    try {
      // console.log("移除", provider.id)
      const resp = await ThirdPartyRemove(provider.id)
      if (resp.status != 200 || resp.data.code != 200) {
        store.userActionDialogLoading = false;
        return;
      }
      provider.isBound = false;
      switch (provider.label) {
        case 'github':
          store.user.security.thirdPartyAccounts.github = false;
          break;
        case "google":
          store.user.security.thirdPartyAccounts.google = false;
          break;
      }
    } catch (e) {
      console.log(e)
    }
    store.userActionDialogLoading = false;
    return;
  } else {
    // console.log("绑定")
    try {
      const resp = await ThirdPartyBind(provider.label)
      if (resp.status === 200 && resp.data.code === 200) {
        window.location.href = resp.data.data.url;
      }
    } catch (e) {
      console.log(e)
    }
  }
  // switch (provider.label) {
  //   case googleProvider.label: // google
  //   case githubProvider.label:  // github
      // try {
      //   const resp = await ThirdPartyBind(label);
      //   if (resp.status === 200 && resp.data.code === 200) {
      //     window.location.href = resp.data.data.url;
      //   }
      // } catch (e) {
      //   console.log(e)
      // }
  //     break;
  //   default:
  //     return;
  // }
}


</script>

<template>
  <div v-loading="store.userActionDialogLoading" element-loading-background="var(--jus-color-icarus-surface)">
    <div v-show="!store.userActionDialogLoading" class="jus-apollo-user-third-party-dialog-body">
      <!--      <div class="jus-apollo-user-passkeys-dialog-body-content-header">-->
      <!--        <span class="jus-apollo-user-passkeys-dialog-body-content-header-text">{{ contentHeaderText }}</span>-->
      <!--        <AddIcon class="jus-apollo-user-passkeys-dialog-body-content-header-icon"/>-->
      <!--      </div>-->
      <div class="jus-apollo-user-third-party-dialog-body">
        <div class="jus-apollo-user-third-party-dialog-body-contents">

          <div class="jus-apollo-user-third-party-dialog-body-content" v-for="provider in thirdPartyProviders" :key="provider.label">
            <div class="jus-apollo-user-third-party-dialog-content-header">
              <component v-if="provider.icon" :is="provider.icon" class="icon"/>
              <span class="jus-apollo-user-third-party-dialog-content-header-title">
                {{ provider.isBound ? provider.boundText : provider.notBoundText }}
              </span>
            </div>
            <div class="jus-apollo-user-third-party-dialog-content-header-text">
              {{ provider.content }}
            </div>
            <el-button class="jus-apollo-user-third-party-dialog-content-action-button" @click="thirdPartyAccountAction(provider)">
              <span class="jus-apollo-user-third-party-dialog-content-action-button-text">
                {{ provider.buttonText }}
              </span>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jus-apollo-user-third-party-dialog-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 18rem;
  flex: 1;
}
.jus-apollo-user-third-party-dialog-body-contents{
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;
}
.jus-apollo-user-third-party-dialog-body-content{
  display: flex;
  flex-direction: column;
  gap: 0.63rem;
}
.jus-apollo-user-third-party-dialog-content-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  gap: 0.5rem;
}
.jus-apollo-user-third-party-dialog-content-header svg.icon{
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  color: var(--jus-color-global-neutrals-text-primary);
  filter: drop-shadow(0 0 4px var(--jus-color-global-neutrals-text-secondary));
}
.jus-apollo-user-third-party-dialog-content-header-title {
  overflow: visible;
  color: var(--jus-color-global-neutrals-text-primary);
  font-size: 1.125rem;
  font-style: normal;
  font-weight: 600;
  line-height: 1.25rem; /* 111.111% */
}
.jus-apollo-user-third-party-dialog-content-header-text {
  color: var(--jus-color-global-neutrals-text-primary);
  margin-left: 1.75rem;
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.5rem; /* 150% */
  letter-spacing: 0.04rem;
}
.jus-apollo-user-third-party-dialog-content-action-button {
  margin-left: 1.75rem;
  width: 5.5rem;
  height: 2.25rem;
  flex-shrink: 0;
  background-color: var(--jus-color-doraemon-primary-200);
  border-radius: 0.5rem;
  border: 1px solid #4070D4;
}
.jus-apollo-user-third-party-dialog-content-action-button-text {
  color: #4070D4;
  font-family: "PingFang SC",serif;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>