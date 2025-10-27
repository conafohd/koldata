<template>
  <footer class="Footer">
    <div class="Footer__actor">      
      <a href="https://conafohd.org/" target="_blank">
        <img src="@/assets/img/conafohd-logo.png" alt="logo-conafohd" class="Footer__logo Footer__logo--conafohd" />
      </a>
    </div>
    <div class="Footer__actor">
      <a href="https://www.cartong.org" target="_blank">
        <img src="@/assets/img/CartONG_logo.svg" alt="logo-cartong" class="Footer__logo Footer__logo--cartong" />
      </a>
    </div>
    <a href="https://github.com/conafohd/koldata" target="_blank">
      <v-icon icon="$github" color="main-blue" />
    </a>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.Footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: row wrap;
  gap: 1rem;
  margin-top: 3rem;
  margin-bottom: 2rem;
  font-weight: 400;
  font-size: .875em;
  text-decoration: none;
  color: rgb(var(--v-theme-main-blue));

  & > *:not(:last-child) {

    &::after {
      content: '';
      height: 1rem;
      width: 1px;
      margin-left: 1rem;
      background: rgba(var(--v-theme-main-blue), .2);
    }
  }

  .Footer__actor {
    display: flex;
    align-items: center;
  }
  img {
    transition: all .15s ease-in;
    &:not(:hover) {
      // opacity: .8;
    }
  }
}
.Footer__logo {
  margin-left: 0.5rem;
  align-items: center;
  display: flex;
  
  &--conafohd {
    width: 3rem;
  }
  &--cartong {
    height: 1.25rem;
  }
}
</style>
