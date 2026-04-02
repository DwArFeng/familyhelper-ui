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
    name: '通知接收',
    description: '通知接收',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '通知设置',
    description: '通知设置',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '主题设置',
    description: '主题设置',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
    },
  },
  {
    key: 'notifyManagement.metaIndicator',
    name: '元数据指示器',
    description: '元数据指示器',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '元数据管理',
    description: '元数据管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
    },
  },
  {
    key: 'notifyManagement.senderInfo',
    name: '发送器设置',
    description: '发送器设置',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '通知历史',
    description: '通知历史',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '路由器支持',
    description: '路由器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '调度器支持',
    description: '调度器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '发送器支持',
    description: '发送器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
