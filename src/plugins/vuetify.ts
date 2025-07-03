import {
    mdiAccountCircle
} from '@mdi/js'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

const customTheme: ThemeDefinition = {
  colors: {
    'main-blue': '#1c3b87',
    'bright-blue': '#111EF7',
    'light-blue': '#6176AB',
    'main-red': '#E83323',
    'main-yellow': '#F6CC47',
    'light-yellow': '#fdf5da',
    'main-grey': '#E0E0E0',
    'dark-grey': '#999999',
    'light-grey': '#F6F7FA',
    'main-green': '#2D6438'
  }
}

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      accountCircle: mdiAccountCircle
    },
    sets: {
      mdi
    }
  },
  display: {
    mobileBreakpoint: 'lg',
    thresholds: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1100
    }
  },
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme
    }
  },
  defaults: {}
})

