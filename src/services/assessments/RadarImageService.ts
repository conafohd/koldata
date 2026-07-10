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

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Legend, Tooltip)

/**
 * Renders the assessment radar chart off-screen at high resolution and returns
 * a PNG data URL suitable for embedding in the PDF report. Rendering off-screen
 * (rather than reusing the on-screen canvas) guarantees a crisp, predictable
 * image independent of the current viewport size or device pixel ratio.
 */
export class RadarImageService {
  static async toPng(
    labels: string[],
    values: number[],
    width = 900,
    height = 560,
  ): Promise<string> {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    // Keep it out of the layout while chart.js measures it
    canvas.style.position = 'absolute'
    canvas.style.left = '-9999px'
    document.body.appendChild(canvas)

    const chart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: '',
            data: values,
            backgroundColor: 'rgba(50, 92, 142, 0.15)',
            borderColor: 'rgba(50, 92, 142, 0.85)',
            pointBackgroundColor: 'rgba(50, 92, 142, 1)',
            pointBorderColor: '#fff',
            borderWidth: 2,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        devicePixelRatio: 2,
        layout: { padding: { left: 60, right: 60, top: 24, bottom: 24 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20, backdropColor: 'transparent', color: '#94a3b8', font: { size: 12 } },
            grid: { color: '#e2e8f0' },
            angleLines: { color: '#e2e8f0' },
            pointLabels: { color: '#334155', font: { size: 14 } },
          },
        },
      },
    })

    try {
      // Ensure a paint cycle has completed before capturing
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      return canvas.toDataURL('image/png')
    } finally {
      chart.destroy()
      canvas.remove()
    }
  }
}
