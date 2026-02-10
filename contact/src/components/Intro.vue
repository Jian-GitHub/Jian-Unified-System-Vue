<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="greetings">
<!--    <h1 class="green">{{ msg }}</h1>-->
<!--    <div style="display: flex;align-items: baseline">-->

    <div>
      <h1 class="green" style="color: #538CEB">
        祁剑
      </h1>
    <h2>Jian Qi</h2>
    </div>
    <h3 >
      <p style="font-weight: bolder; text-align: center">Please feel free and contact me!</p>
      <br/>
      <p>
        I am a forest, and a night of dark trees, but he who is not afraid of my darkness, will find banks full of roses under my cypresses.
      </p>
      <br/>
      <div style="color: var(--color-text)">
        <a style="display: flex; align-items: center;justify-items: left; padding: 0" href="mailto:e.jianqi@gmail.com" target="_blank" rel="noopener">
          <p style="color: var(--color-text);">&centerdot;&nbsp;</p>
          <p class="email-label" style="color: #C77C97">
            Email:
          </p>
          &nbsp;
          <p class="email-address" style="color: #CEAFBE">
            E.JianQi@Gmail.com
          </p>
        </a>
<!--        <br/>-->
<!--        <a style="display: flex" href="tel:+8615540251709" target="_blank" rel="noopener">-->
<!--          <p style="color: var(&#45;&#45;color-text)">&centerdot;&nbsp;</p>-->
<!--          <p style="color: #C77C97">-->
<!--            Tel:-->
<!--          </p>-->
<!--          &nbsp;-->
<!--          <p style="color: #CEAFBE">-->
<!--            (+86) 15540251709-->
<!--          </p>-->
<!--        </a>-->
<!--        <br/>-->
<!--        <a style="display: flex" href="tel:+64211833385" target="_blank" rel="noopener">-->
<!--          <p style="color: var(&#45;&#45;color-text)">&centerdot;&nbsp;</p>-->
<!--          <p style="color: #C77C97">-->
<!--            Tel:-->
<!--          </p>-->
<!--          &nbsp;-->
<!--          <p style="color: #CEAFBE">-->
<!--            (+64) 021 183 3385-->
<!--          </p>-->
<!--        </a>-->
      </div>
    </h3>
  </div>
</template>

<style scoped>
/* 亮模式 - 无阴影 */
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h2 {
  font-weight: 300;
  font-size: 1.5rem;
  font-style: italic;
  position: relative;
  top: -10px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h3 {
  font-size: 1.2rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1;
}

h3 p {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

/* 亮模式下 email 添加简单描边 */
.email-label,
.email-address {
  font-size: 1.1rem;
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.65);
  letter-spacing: 0.04rem;
}

/* 暗模式 - 添加阴影，h2/h3更亮 */
@media (prefers-color-scheme: dark) {
  h1 {
    text-shadow: 0 2px 8px rgba(0, 0, 0, 1);
    filter: brightness(1.3);
  }

  h2 {
    color: rgba(255, 255, 255, 0.98);
    text-shadow: 0 2px 6px rgba(0, 0, 0, 1);
  }

  h3 {
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 1);
  }

  h3 p {
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 1);
  }

  /* 暗模式下提亮 email - 直接使用提亮后的颜色值 */
  .email-label {
    color: #FFA1C4 !important;
  }

  .email-address {
    color: #FFE4F7 !important;
  }
}

.greetings h1,
.greetings h2 {
  text-align: center;
}

.greetings h3 {
  text-align: left;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h2,
  .greetings h3 {
    text-align: left;
  }

}
</style>


