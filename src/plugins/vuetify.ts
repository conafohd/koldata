import {
  mdiAccountCircle
} from '@mdi/js'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

const customTheme: ThemeDefinition = {
  colors: {
    'main-blue': '#1952BD',
    'light-blue': '#8ED1FC',
    'main-purple': '#6431F6',
    'main-grey': '#777777'
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

