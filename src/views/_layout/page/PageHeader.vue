<template>
  <header class="PageHeader">
    <div class="PageHeader__title">
      <h1 class="PageTitle">{{ title }}</h1>
      <v-chip color="main-blue" class="ml-2" size="small" v-if="itemsTotalCount">
        {{ (itemsFiltersCount !=  itemsTotalCount ? `${itemsFiltersCount} / ` : '') + itemsTotalCount }}
      </v-chip>
    </div>
    <div class="PageHeader__filtersCounter" v-if="activeFiltersCount">
      <v-chip color="light-blue"  size="small">{{ activeFiltersCount }}</v-chip>
      <v-btn variant="text" size="small" class="PageHeader__reset-btn" @click="emits('resetFilters')">
        {{ $t('pageHeader.resetFilters') }}
      </v-btn>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  activeFiltersCount: number
  itemsTotalCount?: number
  itemsFiltersCount?: number
}>()

const emits = defineEmits(['resetFilters'])
</script>

<style lang="scss">
.PageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-flow: row wrap;
  gap: 1rem;
  margin: 1rem 0 1rem 0;

  &__title {
    @media (max-width: $bp-sm) {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media (min-width: $bp-sm) {
      display: flex;
      align-items: center;
    }
  }

  &__filtersCounter {
    @media (max-width: $bp-sm) {
      display: flex;
      justify-content: end;
      flex-grow: 1;
      align-items: center;
    }

    @media (min-width: $bp-sm) {
      display: flex;
      align-items: center;
    }
  }

  &__reset-btn {
    color: #666;
    font-size: 0.875rem;
    text-transform: none;
    letter-spacing: normal;
  }
}
</style>