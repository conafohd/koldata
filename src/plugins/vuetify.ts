import {
  mdiAccountCircle,
  mdiAccountCircleOutline,
  mdiAccountGroup,
  mdiApplicationArrayOutline,
  mdiArrowLeft,
  mdiCalendar,
  mdiCardAccountMailOutline,
  mdiCardAccountPhoneOutline,
  mdiChartBoxMultipleOutline,
  mdiCheckCircle,
  mdiClose,
  mdiFileCheckOutline,
  mdiImagePlus,
  mdiInformationSlabBoxOutline,
  mdiLogin,
  mdiLogout,
  mdiMagnify,
  mdiMap,
  mdiMonitorDashboard,
  mdiNewBox,
  mdiReceiptClock,
  mdiSecurity,
  mdiSelectMarker,
  mdiSquareEditOutline,
  mdiTimerEditOutline,
  mdiTrashCanOutline
} from '@mdi/js'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

const customTheme: ThemeDefinition = {
  colors: {
    'main-blue': '#1952BD',
    'light-blue': '#8ED1FC',
    'main-purple': '#6431F6',
    'main-grey': '#575757',
    'light-grey': '#D9D9D9'
  }
}

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      accountCircle: mdiAccountCircle,
      calendar: mdiCalendar,
      arrowLeft: mdiArrowLeft,
      squareEditOutline: mdiSquareEditOutline,
      login: mdiLogin,
      logout: mdiLogout,
      security: mdiSecurity,
      monitorDashboard: mdiMonitorDashboard,
      map: mdiMap,
      accountGroup: mdiAccountGroup,
      close: mdiClose,
      selectMarker: mdiSelectMarker,
      informationSlabBoxOutline: mdiInformationSlabBoxOutline,
      cardAccountMailOutline: mdiCardAccountMailOutline,
      chartBoxMultipleOutline: mdiChartBoxMultipleOutline,
      timerEditOutline: mdiTimerEditOutline,
      trashCanOutline: mdiTrashCanOutline,
      newBox: mdiNewBox,
      fileCheckOutline: mdiFileCheckOutline,
      receiptClock: mdiReceiptClock,
      applicationArrayOutline: mdiApplicationArrayOutline,
      magnify: mdiMagnify,
      imagePlus: mdiImagePlus,
      accountCircleOutline: mdiAccountCircleOutline,
      cardAccountPhoneOutline: mdiCardAccountPhoneOutline,
      checkCircle: mdiCheckCircle
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
  defaults: {
    VBtn: {
      style: [
        {
          textTransform: 'none',
          fontWeight: 'bold',
          letterSpacing: '.045rem'
        }
      ]
    },
  }
})

