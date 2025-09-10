<script setup lang="ts">
import AppleLineLogo from "@/assets/logo/apple_line_20x20.svg";
import PasswordIcon from "@/assets/icon/password_input_20x20.svg";
import SecurityIcon from "@/assets/icon/token_20x20.svg";
import EmailIcon from "@/assets/icon/email_20x20.svg";
import PasskeysIcon from "@/assets/logo/passkeys_outline_20x20.svg";
import ThirdPartyIcon from "@/assets/logo/github_20x20.svg";
import RemoveAccountIcon from "@/assets/icon/passkey_20x20.svg";
import type {Component} from "vue"

type UserSecurityAction = {
  title: string,
  icon: Component,
  text_line1: string,
  text_line2: string,
  text_line3: string,
}

const actionCards: UserSecurityAction[] = [
  {title: '电子邮件和电话号码', icon: AppleLineLogo, text_line1: '201824101323@hainnu.edu.cn', text_line2: 'jq71@students.waikato.ac.nz', text_line3: '和其他 2 个联系方式'},
  {title: '密码', icon: PasskeysIcon, text_line1: '上次更新: 2023年6月2日', text_line2: '', text_line3: ''},
  {title: '账户安全', icon: SecurityIcon, text_line1: '令牌', text_line2: '2 个受信任令牌', text_line3: ''},
  {title: '通知电子邮件', icon: EmailIcon, text_line1: 'e.jianqi@gmail.com', text_line2: '', text_line3: ''},
  {title: '通行密钥', icon: PasskeysIcon, text_line1: '1 个', text_line2: '', text_line3: ''},
  {title: '第三方账号', icon: ThirdPartyIcon, text_line1: 'GitHub: 已绑定', text_line2: 'Google: 未绑定', text_line3: ''},
  {title: '注销账号', icon: RemoveAccountIcon, text_line1: '注销后无法恢复', text_line2: '', text_line3: ''},
]
</script>

<template>
  <div class="right-content">
    <!-- 页面标题和描述 -->
    <div class="page-header">
      <h1 class="main-title">登录和安全</h1>
      <p class="page-description">管理与登录账户、账户安全以及无法登录时进行数据恢复有关的设置。</p>
    </div>

    <!-- 安全设置卡片 -->
    <div class="cards-container">
      <!-- 电子邮件和电话号码卡片 -->
      <button class="security-card" v-for="(card, index) in actionCards" :key="index">
        <div class="card-header">
          <h3 class="card-title">{{card.title}}</h3>
          <div class="card-icon">
            <Component :is="card.icon"/>
          </div>
        </div>
        <div class="card-content">
          <p>{{card.text_line1}}</p>
          <p>{{card.text_line2}}</p>
          <p>{{card.text_line3}}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 右侧内容区域 */
.right-content {
  /*
  display: grid;
  grid-template-columns: max-content;
  grid-template-rows: max-content;
  place-items: start;
  position: relative;

  flex-shrink: 0;
   */

  width: 41.875rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/*
.page-header {
  position: absolute;
  top: 3.8125rem;
  left: 0;
  transform: translateY(-50%);
}

 */

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
  white-space: nowrap;

  color: var(--jus-color-global-neutrals-text-primary);
  font-style: normal;
  line-height: normal;
  margin-top: 0.94rem;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;

  margin-top: 2.69rem;
  flex: 1;
}
:deep(.el-scrollbar__view) {
  height: 100%;
  padding-bottom: 0.5rem;
  display: flex;
  width: 41.875rem;
  align-items: flex-start;
  align-content: flex-start;
  gap: 1.25rem;
  flex-shrink: 0;
  flex-wrap: wrap;
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
  border: 0.05rem solid var(--jus-color-global-neutrals-text-secondary, #757575);

  /* Default Shadow */
  box-shadow: 0 2px 6px 0 var(--jus-color-global-neutrals-text-primary);

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

  color: #4070D4;
}

.card-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.card-content {

  display: flex;
  width: 13.4375rem;
  height: 3.875rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.card-content p {
  font-family: 'PingFang SC', sans-serif;
  /*
  align-items: center;

   */

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