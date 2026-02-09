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
        <!--      <br/>-->
        <!--      Jian Qi-->
      </h1>
    <h2 style="font-size: 1.5rem;font-weight: 300;font-style: italic">Jian Qi</h2>
    </div>
<!--      <h2 class="green" style="font-style: italic">-->
<!--        Jian Qi-->
<!--      </h2>-->
<!--    </div>-->
    <h3 >
<!--      <p>You can contact me through these communication software.</p>-->
      <p style="font-weight: bolder">Please feel free and contact me!</p>
      <p>
        I am a forest, and a night of dark trees, but he who is not afraid of my darkness, will find banks full of roses under my cypresses.
      </p>
      <br/>
      <div style="color: var(--color-text)">
        <a style="display: flex" href="mailto:e.jianqi@gmail.com" target="_blank" rel="noopener">
          <p style="color: var(--color-text)">&centerdot;&nbsp;</p>
          <p style="color: #C77C97">
            Email:
          </p>
          &nbsp;
          <p style="color: #CEAFBE">
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
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}
h2 {
  font-weight: 300;
  //font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h2,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h2,
  .greetings h3 {
    text-align: left;
  }

}
</style>
