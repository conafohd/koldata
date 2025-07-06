<template>
  <div>
    <v-table>
      <tbody>
        <tr v-for="(value, key) in association" :key="key">
          <td>{{ key }}</td>
          <td>{{ value }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup lang="ts">
import type { Association } from '@/models/interfaces/Association'

defineProps<{
  association: Association
}>()
</script>
