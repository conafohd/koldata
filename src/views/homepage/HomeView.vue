<template>
  <div class="HomeView">
    <h1 class="HomeView__title mb-8">{{ $t('home.title') }}</h1>
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
    <span class="HomeView__text" v-html="$t('home.desc3')"></span>
    <h2 class="HomeView__title mt-8">{{ $t('home.title2') }}</h2>
    <span class="HomeView__text text-justify" v-html="$t('home.desc4')"></span>
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
    <h2 class="HomeView__title">{{ $t('home.title3') }}</h2>
    <span class="HomeView__text" v-html="$t('home.desc5')"></span>
    <h2 class="HomeView__title">{{ $t('home.title4') }}</h2>
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
  gap: 1.5rem;
  margin-top: 4rem;
  h1 {
    font-size: 2.25rem;
    line-height: 2.75rem;
    text-align: center;
  }
  h2 {
    font-size: 1.5rem;
  }
}
.HomeView__title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
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
