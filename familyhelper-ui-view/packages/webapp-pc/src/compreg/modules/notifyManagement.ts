// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type ComponentSetting, type VimCompregModule } from '@/compreg/types.ts'

/**
 * VIM Compreg 模块。
 */
const vimCompregModule: VimCompregModule = {
  init,
  provideComponentSettings: provideCompregSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * Compreg 设置数组。
 */
const compregSettings: ComponentSetting[] = [
  {
    key: 'notifyManagement.notification',
    component: {
      '': () => import('@/views/nodes/elementPlus/notifyManagement/notification/Notification.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/notifyManagement/notification/Notification.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/notifyManagement/notification/Notification.vue'),
    },
  },
  {
    key: 'notifyManagement.notifySetting',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/notifyManagement/notifySetting/NotifySetting.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/notifyManagement/notifySetting/NotifySetting.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/notifyManagement/notifySetting/NotifySetting.vue'),
    },
  },
  {
    key: 'notifyManagement.topic',
    component: {
      '': () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
    },
  },
  {
    key: 'notifyManagement.metaIndicator',
    component: {
      '': () =>
        import(
          '@/views/nodes/elementPlus' +
            '/notifyManagement/metaIndicator/subPanels/MetaIndicator.vue'
        ),
      elementPlus: () =>
        import(
          '@/views/nodes/elementPlus' +
            '/notifyManagement/metaIndicator/subPanels/MetaIndicator.vue'
        ),
      comvisual: () =>
        import(
          '@/views/nodes/elementPlus' +
            '/notifyManagement/metaIndicator/subPanels/MetaIndicator.vue'
        ),
    },
  },
  {
    key: 'notifyManagement.meta',
    component: {
      '': () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
    },
  },
  {
    key: 'notifyManagement.senderInfo',
    component: {
      '': () => import('@/views/nodes/elementPlus/notifyManagement/senderInfo/SenderInfo.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/notifyManagement/senderInfo/SenderInfo.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/notifyManagement/senderInfo/SenderInfo.vue'),
    },
  },
  {
    key: 'notifyManagement.notifyHistory',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/notifyManagement/notifyHistory/NotifyHistory.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/notifyManagement/notifyHistory/NotifyHistory.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/notifyManagement/notifyHistory/NotifyHistory.vue'),
    },
  },
  {
    key: 'notifyManagement.routerSupport',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/notifyManagement/routerSupport/RouterSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/notifyManagement/routerSupport/RouterSupport.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/notifyManagement/routerSupport/RouterSupport.vue'),
    },
  },
  {
    key: 'notifyManagement.dispatcherSupport',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/notifyManagement/dispatcherSupport/DispatcherSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/notifyManagement/dispatcherSupport/DispatcherSupport.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/notifyManagement/dispatcherSupport/DispatcherSupport.vue'),
    },
  },
  {
    key: 'notifyManagement.senderSupport',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/notifyManagement/senderSupport/SenderSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/notifyManagement/senderSupport/SenderSupport.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/notifyManagement/senderSupport/SenderSupport.vue'),
    },
  },
]

/**
 * 提供 ComponentSetting。
 */
function provideCompregSettings(): ComponentSetting[] {
  return compregSettings
}

export default vimCompregModule
