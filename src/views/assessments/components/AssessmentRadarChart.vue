<template>
  <div class="AssessmentRadarChart">
    <canvas ref="canvasEl" style="width:100%;height:100%;" />
  </div>
</template>

<script setup lang="ts">
import {
  Chart,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { ref } from 'vue'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Legend, Tooltip)

const props = defineProps<{
  labels: string[]
  values: number[]
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'radar'> | null = null

function buildDataset() {
  return {
    label: '',
    data: props.values,
    backgroundColor: 'rgba(50, 92, 142, 0.15)',
    borderColor: 'rgba(50, 92, 142, 0.85)',
    pointBackgroundColor: 'rgba(50, 92, 142, 1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(50, 92, 142, 1)',
    borderWidth: 2,
    pointRadius: 4,
  }
}

onMounted(() => {
  if (!canvasEl.value) return
  chartInstance = new Chart(canvasEl.value, {
    type: 'radar',
    data: {
      labels: props.labels,
      datasets: [buildDataset()],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { left: 40, right: 40, top: 16, bottom: 16 },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.raw}%`,
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            font: { size: 10 },
            color: '#94a3b8',
            backdropColor: 'transparent',
            callback: (v) => `${v}%`,
          },
          pointLabels: {
            font: { size: 11, weight: 'bold' },
            color: '#475569',
            callback: (label: string) => {
              const maxLen = 28
              if (label.length <= maxLen) return label
              const words = label.split(' ')
              const lines: string[] = []
              let current = ''
              for (const word of words) {
                const candidate = current ? `${current} ${word}` : word
                if (candidate.length <= maxLen) {
                  current = candidate
                } else {
                  if (current) lines.push(current)
                  current = word
                }
              }
              if (current) lines.push(current)
              return lines
            },
          },
          grid: { color: '#e2e8f0' },
          angleLines: { color: '#e2e8f0' },
        },
      },
    },
  })
})

watch(
  () => [props.labels, props.values],
  () => {
    if (!chartInstance) return
    chartInstance.data.labels = props.labels
    chartInstance.data.datasets = [buildDataset()]
    chartInstance.update()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  chartInstance?.destroy()
  chartInstance = null
})
</script>

<style scoped>
.AssessmentRadarChart {
  width: 100%;
  aspect-ratio: 5 / 2;
}
</style>
