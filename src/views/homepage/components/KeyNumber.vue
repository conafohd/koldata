<template>
  <div class="keyNumber">
    <span class="keyNumber__label">{{ label }}</span>
    <span class="keyNumber__value">{{ formatNumber(keyNumber) }}</span>
  </div>
</template>
<script lang="ts" setup>
import { formatNumber } from '@/services/utils/FormatNumber'

defineProps<{
  label: string
  keyNumber: number
}>()
</script>

<style lang="scss">
.keyNumber {
  display: flex;
  flex-direction: column;
  align-items: center;
  &__label {
    font-weight: 600;
  }

  &__value {
    font-size: 2.5em;
    font-weight: bolder;
    color: rgb(var(--v-theme-main-purple));
  }
}
</style>
