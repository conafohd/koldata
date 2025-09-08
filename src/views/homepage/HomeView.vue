<template>
  <div class="HomeView">
    <span class="HomeView__title">{{ $t('home.title') }}</span>
    <span class="HomeView__subtitle" v-html="$t('home.desc')"></span>
    <div class="HomeView__list">
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list1') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list2') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list3') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list4') }}</span
      >
    </div>
    <span class="HomeView__text" v-html="$t('home.desc2')"></span>
    <span class="HomeView__title mt-8">{{ $t('home.title2') }}</span>
    <span class="HomeView__text text-justify" v-html="$t('home.desc3')"></span>
    <div class="HomeView__list">
      <span
        ><v-icon color="main-blue" icon="$accountSupervisorCircle" class="mr-2"></v-icon
        >{{ $t('home.list5') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$accountSupervisorCircle" class="mr-2"></v-icon
        >{{ $t('home.list6') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$accountSupervisorCircle" class="mr-2"></v-icon
        >{{ $t('home.list7') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$accountSupervisorCircle" class="mr-2"></v-icon
        >{{ $t('home.list8') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$accountSupervisorCircle" class="mr-2"></v-icon
        >{{ $t('home.list9') }}</span
      >
    </div>
    <span class="HomeView__text"
      >Contact:
      <a href="https://conafohd.org/contacts/" target="_blank"
        >https://conafohd.org/contacts/</a
      ></span
    >
    <span class="HomeView__title">{{ $t('home.title3') }}</span>
    <span class="HomeView__text" v-html="$t('home.desc4')"></span>
    <span class="HomeView__title">{{ $t('home.title4') }}</span>
    <div class="HomeView__list">
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list10') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list11') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list12') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list13') }}</span
      >
      <span
        ><v-icon color="main-blue" icon="$sendCircleOutline" class="mr-2"></v-icon
        >{{ $t('home.list14') }}</span
      >
    </div>
  </div>
</template>
<script setup lang="ts"></script>

<style lang="scss">
.HomeView {
  display: flex;
  flex-direction: column;
  width: 80%;
  gap: 1.5rem;
  align-items: center;
  margin-top: 4rem;
  text-align: center;
}
.HomeView__title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: -0.5rem;
}
.HomeView__subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  > a {
    color: rgb(var(--v-theme-light-blue));
    text-decoration: none;
  }
}
.HomeView__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}
.HomeView__text {
  font-weight: 500;
  > a {
    color: rgb(var(--v-theme-light-blue));
    text-decoration: none;
  }
}
</style>
