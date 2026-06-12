<template>
  <v-breadcrumbs :items="items" class="AppBreadcrumb">
    <template #item="{ item }">
      <v-breadcrumbs-item
        :to="item.to"
        :disabled="item.disabled"
      >
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
    <template #divider>
      <v-icon icon="$chevronRight" size="16" color="main-grey" />
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  title: string
  to?: string
  disabled?: boolean
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<style scoped lang="scss">
.AppBreadcrumb {
  padding: .5rem 0 1.25rem 0;
  align-items: center;

  :deep(.v-breadcrumbs__item--disabled) {
    opacity: 1;
    font-weight: 600;
    color: rgb(var(--v-theme-main-blue));
  }

  :deep(.v-breadcrumbs-item) {
    font-size: 0.8rem;
    padding: 0;
    line-height: 1;
  }

  :deep(.v-breadcrumbs-divider) {
    padding: 0 4px;
    display: flex;
    align-items: center;
  }
}
</style>
