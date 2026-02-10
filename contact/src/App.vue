<script setup lang="ts">
import Intro from './components/Intro.vue'
import TheWelcome from './components/TheWelcome.vue'
import WhiteCard from "./components/views/WhiteCard.vue";
import ImgCard from "./components/views/ImgCard.vue";
// WhatsApp
import whatsapp_icon from "./assets/whatsapp/whatsapp_icon.svg"
import whatsapp_qrCode from "./assets/whatsapp/whatsapp_qrcode.webp"
// QQ
import qq_icon from "./assets/qq/qq_icon.svg"
import qq_qrCode from "./assets/qq/qq_qrCode.webp"
// WeChat
import wechat_icon from "./assets/wechat/wechat_icon.svg"
import wechat_qrCode from "./assets/wechat/wechat_qrCode.webp"
// Instagram
// import instagram_icon from "./assets/instagram/instagram_icon.svg"
import instagram_icon from "./assets/instagram/instagram.svg"
// import instagram_icon from "./assets/instagram/ins_icon.svg"
import instagram_qrCode from "./assets/instagram/instagram_qrCode.webp"
// Line
import line_icon from "./assets/line/line_icon.svg"
import line_qrCode from "./assets/line/line_qrCode.webp"


import {ref, onMounted, onBeforeUnmount, watch, onBeforeMount, onUnmounted, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {Token} from "./api/token";
import store from "./store/index";

// i18n
import {useI18n} from "vue-i18n";
const {locale} = useI18n()

// background
import ColorBends from './components/ColorBends/ColorBends.vue'

import SpotlightCard from "./components/SpotlightCard/SpotlightCard.vue";
import GlassSurface from "../../core/components/GlassSurface/GlassSurface.vue";

// const router = useRouter(); // 创建路由实例

const screenWidth = ref(window.innerWidth);
const xsSpan = ref(24);
const smSpan = ref(24);
const mdSpan = ref(12);
const lgSpan = ref(12);
const xlSpan = ref(8);
const isScrollbar = ref(true);

const router = useRouter();
let token = ref('');
let authorizationCode = ref('');

let isLogin = ref(false)

let checkTimer = null;

// 更新屏幕宽度
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

// onBeforeMount(() => {
//   // screenResized(window.innerWidth);
//   // console.log(typeof whatsApp_qrCode,'a');
//   // initAppList();
//   // console.log(appList);
//
//   // getAuthorizationCodeURL();
//
//   // checkStatus();
// })
async function checkStatus() {
  let thisURL = location.origin + location.pathname
  // await checkStatus();
  //
  //
  // setInterval(checkStatus, 15 * 60 * 1000);
  // document.addEventListener('visibilitychange', checkToken)
//Object.keys(to.query).length > 0
  await router.isReady()

  // 路径有参数 - 获取授权码后进行跳转
  // alert("路径参数: " + Object.keys(router.currentRoute.value.query) + " - " + Object.keys(router.currentRoute.value.query).length)
  // alert(Object.keys(router.currentRoute.value.query).length > 0)
  if (Object.keys(router.currentRoute.value.query).length > 0) {
    // 获取授权码, 存储到local
    authorizationCode.value = <string>router.currentRoute.value.query.authorizationCode
    if (authorizationCode.value != null && authorizationCode.value != '') {
      //存储
      // alert("存储authorizationCode: "+authorizationCode.value)
      localStorage.setItem('authorizationCode', authorizationCode.value);
      // 跳转无参数页面
      // alert("跳转无参数页面")
      location.href = thisURL
    }
  } else {
    //路径无参数 - 1.local有授权码 2.local无授权码 有token
    // 从local获取授权码
    authorizationCode.value = localStorage.getItem('authorizationCode')
    // alert("从local获取授权码: " + authorizationCode.value)
    if (authorizationCode.value != null && authorizationCode.value != '') {
      // local有授权码, 进行索取Token
      // alert("路径无参数, local有授权码, 进行索取Token")

      let authorizationCodeParam = authorizationCode.value
      authorizationCode.value = '';
      // alert("使用授权码索取 : " + authorizationCodeParam)
      await Token.getByCode(authorizationCodeParam)
          .then(response => {
            // alert("路由验证授权码后 得到响应状态 : " + response.status)
            // alert("路由验证授权码后 得到响应数据 : " + response.data)
            // console.log(response.data)
            if (response.status !== 200) {
              isLogin.value = false;
              // alert("验证授权码失败")
              localStorage.removeItem('authorizationCode')
              // 验证失败, 重定向到登录页
              location.href = store.loginPageURL + '?from=' + thisURL;
            } else {
              // alert("路由中授权码 验证成功 得到 token : " + response.data)
              localStorage.setItem('token', response.data)
              localStorage.removeItem('authorizationCode')
              // next()
              isLogin.value = true;
            }
          })
          .catch(e => {
            isLogin.value = false;
            console.error(e)
            localStorage.removeItem('authorizationCode')
            // alert("出现错误: " + e.toString())
            location.href = store.loginPageURL + '?from=' + thisURL;
          })
    } else {
      // local无授权码 - 检查本地token是否存在
      // 尝试获取token
      token.value = localStorage.getItem('token')
      if (token.value != null && token.value != '') {
        // token 存在 - 进行验证
        // alert("local无授权码, token 存在 - 进行验证")

        await Token.verify(token.value)
            .then(response => {
              // alert('状态为!response.status: ' + response.status)
              if (response.status !== 200) {
                isLogin.value = false;
                localStorage.removeItem('token')
                // alert("网页中 无授权码, 且 Token 验证失败")
                location.href = store.loginPageURL + '?from=' + thisURL;
              } else {
                // alert("当前已登录")
                isLogin.value = true;
                // next();
              }
            })
            .catch(e => {
              // alert("出现错误")
              console.error(e)
              location.href = store.loginPageURL + '?from=' + thisURL;
              // alert(e)
            })
      } else {
        // Token不存在 -> 本地无授权码无token, 未登录
        // 跳转到登录页
        // alert("本地无授权码无token")
        location.href = store.loginPageURL + '?from=' + thisURL;
      }
    }
  }
}

onMounted(async () => {
  screenResized(window.innerWidth);
  initAppList();
  isLogin.value = true;
  //
  // await checkStatus();
  // checkTimer = getTimer();
  // document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  // document.removeEventListener('visibilitychange', handleVisibilityChange)
  // clearInterval(checkTimer)
})
function getTimer() {
  clearInterval(checkTimer);
  return setInterval(checkStatus, 15 * 60 * 1000);
}
const handleVisibilityChange = function () {
  clearInterval(checkTimer)
  if (document.visibilityState === 'hidden') {

  }
  if (document.visibilityState === 'visible') {
    checkStatus();
    checkTimer = getTimer();
  }
}

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', updateScreenWidth, {passive: true});
});

onBeforeUnmount(() => {
  // 移除监听器，防止内存泄漏
  window.removeEventListener('resize', updateScreenWidth);
});

function screenResized(newWidth) {
  /*
  xs	<768px
  sm	≥768px
  md	≥992px
  lg	≥1200px
  xl	≥1920px
  700
  700 - 1000
  1000 - 1024
   */
  switch (true) {
    case newWidth < 700:
      // console.log('newWidth < 700')
      xsSpan.value = 24;
      smSpan.value = 12;
      isScrollbar.value = false;
      break;
    case newWidth >= 700 && newWidth < 1000:
      // console.log('newWidth >= 700 && newWidth < 1000')
      xsSpan.value = 12;
      // case newWidth < 1000:
      smSpan.value = 12;
      mdSpan.value = 8;
      isScrollbar.value = false;
      break;
    case newWidth >= 1000 && newWidth < 1024:
      // console.log('newWidth >= 1000 && newWidth < 1024:')
      smSpan.value = 8;
      // case newWidth < 1024:
      xsSpan.value = 24;
      isScrollbar.value = false;
      break;
    case newWidth >= 1024 && newWidth < 1560:
      mdSpan.value = 12;
      lgSpan.value = 12;
      xlSpan.value = 8;
      isScrollbar.value = true;
      // isScrollbar.value = false;
      break;
    case newWidth > 1560 && newWidth < 2050:
      lgSpan.value = 8;
      xlSpan.value = 8;
      isScrollbar.value = true;
      break;
    case newWidth > 2050 && newWidth < 3000:
      xlSpan.value = 6;
      isScrollbar.value = true;
      break;
  }
}

// 监听 screenWidth 的变化，根据需要设置 xsSpan
watch(screenWidth, (newWidth) => {
  // console.log(newWidth)
  screenResized(newWidth)
  // if (newWidth < 1024) {
  //   xsSpan.value = 24;
  // } else if (newWidth > 1560) {
  //   lgSpan.value = 8;
  // } else {
  //   xsSpan.value = 24;
  // }
});

interface appListElement {
  name: string,
  icon: string,
  qrCode: string,
  color: string,
}

let appList: appListElement[];

function initAppList() {
  const qq: appListElement = {
    icon: qq_icon,
    color: '#EFAF3E',
    name: "QQ",
    qrCode: qq_qrCode
  };
  const weChat: appListElement = {
    icon: wechat_icon,
    color: "",
    name: 'WeChat',
    qrCode: wechat_qrCode
  };
  const instagram: appListElement = {
    icon: instagram_icon,
    color: '#D75B8B',
    name: "Instagram",
    qrCode: instagram_qrCode
  };
  const line: appListElement = {
    icon: line_icon,
    color: "",
    name: 'Line',
    qrCode: line_qrCode
  };
  const whatsApp: appListElement = {
    icon: whatsapp_icon,
    color: '#65CF72',
    name: 'WhatsApp',
    qrCode: whatsapp_qrCode
  };
  appList = [
    qq,
    weChat,
    instagram,
    line,
    whatsApp
  ]
}

</script>

<template>
  <!-- ColorBends 固定背景层 - 扩大120%覆盖拉扯区域 -->
  <div style="position: fixed; top: -10%; left: -10%; right: -10%; bottom: -10%; z-index: -1; overflow: hidden; width: 120vw; height: 120vh;">
    <ColorBends
        style="width: 100%; height: 100%;"
        :rotation="0"
        :auto-rotate="1"
        :speed="0.2"
        :scale="1"
        :frequency="1"
        :warpStrength="1"
        :mouseInfluence="1"
        :parallax="0.5"
        :noise="0.1"
        transparent
    />
  </div>

  <header v-if="isLogin">
    <!--    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125"/>-->
    <div class="wrapper">
      <div style="position: relative; width: 100%; height: 100%;">
        <!-- GlassSurface 作为背景 -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;">
          <GlassSurface
              width="100%"
              height="100%"
              :border-radius="24"
          />
        </div>
        <!-- Intro 在前景 -->
        <div style="position: relative; z-index: 1; padding: 2rem;">
          <Intro msg="祁剑 (Jian Qi)!"/>
        </div>
      </div>
    </div>
  </header>

  <main v-if="isLogin" :class="{ 'use-el-scroll': isScrollbar }">
    <!-- 宽屏：使用 el-scrollbar + 渐变模糊 -->
    <div v-if="isScrollbar" style="position: relative; width: 100%; height: 100vh;overflow-y: visible">
      <el-scrollbar style="height: calc(100vh - 10rem); width: 100%;margin-top: 2rem;margin-bottom: 5rem;overflow-y: visible">
        <el-row :gutter="0" style="overflow-x: hidden !important; padding-bottom: 150px;">
          <el-col v-for="app in appList" :xs="xsSpan" :sm="smSpan" :md="mdSpan" :lg="lgSpan" :xl="xlSpan">
            <ImgCard :icon="app.icon" :qr-code="app.qrCode" :name="app.name"/>
          </el-col>
        </el-row>
      </el-scrollbar>
    </div>

    <!-- 窄屏：普通滚动 -->
    <div v-else style="width: 100%;">
      <el-row :gutter="0" style="overflow-x: visible;overflow-y: visible">
        <el-col v-for="app in appList" :xs="xsSpan" :sm="smSpan" :md="mdSpan" :lg="lgSpan" :xl="xlSpan">
          <ImgCard :icon="app.icon" :qr-code="app.qrCode" :name="app.name"/>
        </el-col>
      </el-row>
    </div>
  </main>

  <!-- 顶部渐变模糊 - 移到 main 外，使用 fixed 定位，完全不受任何容器限制 -->
  <div v-if="isLogin && isScrollbar" style="position: fixed; top: 0; left: 0; right: 0; height: 10rem; z-index: 1000; pointer-events: none;">
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px); mask-image: linear-gradient(to bottom, black 0%, black 35%, transparent 100%);"></div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 95%);"></div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); mask-image: linear-gradient(to bottom, black 0%, black 15%, transparent 80%);"></div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); mask-image: linear-gradient(to bottom, black 0%, black 8%, transparent 60%);"></div>
  </div>

  <!-- 底部渐变模糊 - 移到 main 外，使用 fixed 定位，完全不受任何容器限制 -->
  <div v-if="isLogin && isScrollbar" style="position: fixed; bottom: 0; left: 0; right: 0; height: 15rem; z-index: 1000; pointer-events: none;">
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px); mask-image: linear-gradient(to top, black 0%, black 35%, transparent 100%);"></div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); mask-image: linear-gradient(to top, black 0%, black 25%, transparent 95%);"></div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); mask-image: linear-gradient(to top, black 0%, black 15%, transparent 80%);"></div>
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); mask-image: linear-gradient(to top, black 0%, black 8%, transparent 60%);"></div>
  </div>


</template>

<style scoped>
header {
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto; /* allow natural flow on small screens */
}

main {
  display: block;
  align-items: stretch;
  justify-content: stretch;
  height: auto; /* natural height so page can scroll from top to bottom */
}

/* When using the el-scrollbar (wide screens), force main to be viewport-height and hide page scroll */
.use-el-scroll {
  height: 100vh;
  overflow-x: visible;
  overflow-y: hidden;
}

/* 顶部渐变模糊 */
.scroll-blur-top {
  position: absolute;
  top: 5rem;
  left: 0;
  right: 0;
  height: 8rem;
  pointer-events: none;
  z-index: 10;
  background: rgba(255, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 底部渐变模糊 */
.scroll-blur-bottom {
  position: absolute;
  bottom: 5rem;
  left: 0;
  right: 0;
  height: 10rem;
  pointer-events: none;
  z-index: 10;
  background: rgba(0, 0, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

@media (min-width: 1024px) {
  header {
    height: 100vh; /* left column full height on wide screens */
    overflow: hidden;
    display: flex;
    place-items: center;
  }

  main.use-el-scroll {
    height: 100vh;
    overflow: hidden;
  }

  .logo {
    margin: 0 2rem 0 50px;
  }

  header .wrapper {
    margin-left: 5vw;
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
