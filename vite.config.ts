import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import Vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      Vuetify({
        autoImport: true,
        styles: 'sass'
      }),
    ],
    optimizeDeps: {
      include: ['vue-router']
    },
    base: env.VITE_BASE_PATH || '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
    },
    server: {
      port: 3000,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/_variables";`,
          silenceDeprecations: ['legacy-js-api', 'import']
        }
      }
    }
  }
})