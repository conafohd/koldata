<template>
  <div class="GenericChart">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup lang="ts">
import { getChartsColorsPalette } from '@/services/utils/ChartsColors'
import { formatNumber } from '@/services/utils/FormatNumber'
import { ArcElement, Chart, DoughnutController, Legend, Title, Tooltip } from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title)

interface ChartDataItem {
  label: string
  value: number
}

const props = defineProps<{
  dataset: ChartDataItem[]
  title?: string
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'doughnut'> | null = null
const colors = getChartsColorsPalette()

const createChart = () => {
  if (!canvasEl.value || !props.dataset.length) return

  destroyChart()

  chartInstance = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: {
      labels: props.dataset.map((item) => item.label),
      datasets: [
        {
          data: props.dataset.map((item) => item.value),
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: !!props.title,
          text: props.title,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const item = props.dataset[context.dataIndex]
              const total = props.dataset.reduce((sum, data) => sum + data.value, 0)
              const percentage = ((item.value / total) * 100).toFixed(1)
              return `${item.label}: ${formatNumber(item.value)} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

const updateChart = () => {
  if (!chartInstance) return

  chartInstance.data.labels = props.dataset.map((item) => item.label)
  chartInstance.data.datasets[0].data = props.dataset.map((item) => item.value)
  chartInstance.update()
}

onMounted(createChart)

watch(
  () => props.dataset,
  (newDataset) => {
    if (newDataset.length) {
      chartInstance ? updateChart() : createChart()
    } else {
      destroyChart()
    }
  },
  { deep: true },
)

watch(
  () => props.title,
  () => {
    if (chartInstance) {
      chartInstance.options.plugins!.title!.text = props.title
      chartInstance.options.plugins!.title!.display = !!props.title
      chartInstance.update()
    }
  },
)

onBeforeUnmount(destroyChart)
</script>

<style scoped>
.GenericChart {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
