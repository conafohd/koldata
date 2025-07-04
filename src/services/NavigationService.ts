import { i18n } from '@/plugins/i18n'
import { useRouter, type RouteLocationNormalizedLoadedGeneric } from 'vue-router'
export class NavigationTabsService {
  static getContent() {
    return [
      {
        name: i18n.t('header.tabs.home'),
        value: 0,
        route: '/',
        visible: true
      },
      {
        name: i18n.t('header.tabs.projectsMap'),
        value: 1,
        route: {
          name: 'projectsMap'
        },
        visible: true
      },
      {
        name: i18n.t('header.tabs.associations'),
        value: 2,
        route: {
          name: 'associations'
        },
        visible: true
      },
      
      {
        name: i18n.t('header.tabs.admin'),
        value: 3,
        route: {
          name: 'admin'
        },
        visible: true
      },
    ]
  }
  static getTabsNumberFromRoute(route: RouteLocationNormalizedLoadedGeneric, actualNumber: number) {
    const segments = route.path.split('/').filter(Boolean)
    //When Homepage
    if (segments.length === 0) {
      return 0
    }
    const router = useRouter()
    const newTabsNumber = segments
      .map((string) =>
        this.getContent().find((obj) => router?.resolve(obj.route)?.path.includes(string))
      )
      .filter(Boolean)
      .pop()?.value
    if (newTabsNumber && newTabsNumber !== actualNumber) {
      return newTabsNumber
    }
    // When user select a route that is not in the tabs (eg.Map)
    if (!newTabsNumber) {
      return -1
    }
    return actualNumber
  }
}
