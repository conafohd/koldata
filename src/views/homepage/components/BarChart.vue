<template>
  <div class="InterventionSectorChart">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup lang="ts">
import { getChartsColorsPalette } from '@/services/utils/ChartsColors'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const props = defineProps<{
  data: {
    labels: string[]
    values: number[]
  }
  title: string
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'bar'> | null = null
const colors = getChartsColorsPalette()

onMounted(() => {
  if (!canvasEl.value) return
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(canvasEl.value, {
    type: 'bar',
    data: {
      labels: [''],
      datasets: props.data.labels.map((label: string, i: number) => ({
        label,
        data: [props.data.values[i]],
        backgroundColor: colors[i],
        borderRadius: 2,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: props.title },
      },
      scales: {
        x: { display: false },
      },
    },
  })
})

watch(
  () => props.data,
  (newData) => {
    if (chartInstance) {
      chartInstance.data.labels = ['']
      chartInstance.data.datasets = newData.values.map((value, i) => ({
        label: newData.labels[i],
        data: [value],
        backgroundColor: colors[i],
        borderRadius: 2,
      }))
      chartInstance.update()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.InterventionSectorChart {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
