import { i18n } from '@/plugins/i18n'
import { type RouteLocationNormalizedLoadedGeneric } from 'vue-router'
export class NavigationTabsService {
  static getContent() {
    return [
      {
        name: i18n.t('header.tabs.home'),
        value: 0,
        route: '/',
        icon: '$homeCircleOutline'
      },
      {
        name: i18n.t('header.tabs.dashboard'),
        value: 1,
        route: {
          name: 'dashboard'
        },
        icon: '$monitorDashboard'
      },
      {
        name: i18n.t('header.tabs.projectsMap'),
        value: 2,
        route: {
          name: 'projectsMap'
        },
        icon: '$map'
      },
      {
        name: i18n.t('header.tabs.associations'),
        value: 3,
        route: {
          name: 'associations'
        },
        icon: '$accountGroup'
      }
    ]
  }

  static getTabsNumberFromRoute(route: RouteLocationNormalizedLoadedGeneric, actualNumber: number) {
  const routeToTabMap: { [key: string]: number } = {
    'home': 0,
    'dashboard': 1,
    'projectsMap': 2,
    'associations': 3,
    'association': 3,
    'admin': 4
  }
  
  const tabNumber = routeToTabMap[route.name as string]
  
  if (tabNumber !== undefined) {
    return tabNumber
  }
  
  return actualNumber
}

}
