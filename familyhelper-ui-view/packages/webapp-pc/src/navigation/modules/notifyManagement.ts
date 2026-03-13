// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NavigationNodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNavigationNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * Navigation 节点数组。
 */
const navigationNodes: NavigationNodeSetting[] = [
  {
    parentKey: null,
    key: 'notifyManagement',
    index: 130,
    display: {
      '': {
        label: '通知管理',
      },
      elementPlus: {
        label: '通知管理',
      },
      simple: {
        label: '通知管理',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.notification',
    index: 10,
    display: {
      '': {
        label: '通知接收',
      },
      elementPlus: {
        label: '通知接收',
      },
      simple: {
        label: '通知接收',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-management/notification',
      component: {
        '': () =>
          import('@/views/nodes/elementPlus/notifyManagement/notification/Notification.vue'),
        elementPlus: () =>
          import('@/views/nodes/elementPlus/notifyManagement/notification/Notification.vue'),
        simple: () =>
          import('@/views/nodes/elementPlus/notifyManagement/notification/Notification.vue'),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.notification',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.notifySetting',
    index: 20,
    display: {
      '': {
        label: '通知设置',
      },
      elementPlus: {
        label: '通知设置',
      },
      simple: {
        label: '通知设置',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/notify-setting',
      component: {
        '': () =>
          import('@/views/nodes/elementPlus/notifyManagement/notifySetting/NotifySetting.vue'),
        elementPlus: () =>
          import('@/views/nodes/elementPlus/notifyManagement/notifySetting/NotifySetting.vue'),
        simple: () =>
          import('@/views/nodes/elementPlus/notifyManagement/notifySetting/NotifySetting.vue'),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.notify_setting',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.topic',
    index: 30,
    display: {
      '': {
        label: '主题设置',
      },
      elementPlus: {
        label: '主题设置',
      },
      simple: {
        label: '主题设置',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/topic',
      component: {
        '': () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
        elementPlus: () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
        simple: () => import('@/views/nodes/elementPlus/notifyManagement/topic/Topic.vue'),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.topic',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.metaIndicator',
    index: 40,
    display: {
      '': {
        label: '元数据指示器',
      },
      elementPlus: {
        label: '元数据指示器',
      },
      simple: {
        label: '元数据指示器',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/meta-indicator',
      component: {
        '': () =>
          import(
            '@/views/nodes/elementPlus/notifyManagement/metaIndicator/subPanels/MetaIndicator.vue'
          ),
        elementPlus: () =>
          import(
            '@/views/nodes/elementPlus/notifyManagement/metaIndicator/subPanels/MetaIndicator.vue'
          ),
        simple: () =>
          import(
            '@/views/nodes/elementPlus/notifyManagement/metaIndicator/subPanels/MetaIndicator.vue'
          ),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.meta_indicator',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.meta',
    index: 50,
    display: {
      '': {
        label: '元数据管理',
      },
      elementPlus: {
        label: '元数据管理',
      },
      simple: {
        label: '元数据管理',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/meta',
      component: {
        '': () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
        elementPlus: () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
        simple: () => import('@/views/nodes/elementPlus/notifyManagement/meta/Meta.vue'),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.meta',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.senderInfo',
    index: 60,
    display: {
      '': {
        label: '发送器设置',
      },
      elementPlus: {
        label: '发送器设置',
      },
      simple: {
        label: '发送器设置',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/sender-info',
      component: {
        '': () => import('@/views/nodes/elementPlus/notifyManagement/senderInfo/SenderInfo.vue'),
        elementPlus: () =>
          import('@/views/nodes/elementPlus/notifyManagement/senderInfo/SenderInfo.vue'),
        simple: () =>
          import('@/views/nodes/elementPlus/notifyManagement/senderInfo/SenderInfo.vue'),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.sender_info',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.notifyHistory',
    index: 70,
    display: {
      '': {
        label: '通知历史',
      },
      elementPlus: {
        label: '通知历史',
      },
      simple: {
        label: '通知历史',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/notify-history',
      component: {
        '': () =>
          import('@/views/nodes/elementPlus/notifyManagement/notifyHistory/NotifyHistory.vue'),
        elementPlus: () =>
          import('@/views/nodes/elementPlus/notifyManagement/notifyHistory/NotifyHistory.vue'),
        simple: () =>
          import('@/views/nodes/elementPlus/notifyManagement/notifyHistory/NotifyHistory.vue'),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.notify_history',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.routerSupport',
    index: 80,
    display: {
      '': {
        label: '路由器支持',
      },
      elementPlus: {
        label: '路由器支持',
      },
      simple: {
        label: '路由器支持',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/router-support',
      component: {
        '': () =>
          import('@/views/nodes/elementPlus/notifyManagement/routerSupport/RouterSupport.vue'),
        elementPlus: () =>
          import('@/views/nodes/elementPlus/notifyManagement/routerSupport/RouterSupport.vue'),
        simple: () =>
          import('@/views/nodes/elementPlus/notifyManagement/routerSupport/RouterSupport.vue'),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.router_support',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.dispatcherSupport',
    index: 90,
    display: {
      '': {
        label: '调度器支持',
      },
      elementPlus: {
        label: '调度器支持',
      },
      simple: {
        label: '调度器支持',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/dispatcher-support',
      component: {
        '': () =>
          import(
            '@/views/nodes/elementPlus/notifyManagement/dispatcherSupport/DispatcherSupport.vue'
          ),
        elementPlus: () =>
          import(
            '@/views/nodes/elementPlus/notifyManagement/dispatcherSupport/DispatcherSupport.vue'
          ),
        simple: () =>
          import(
            '@/views/nodes/elementPlus/notifyManagement/dispatcherSupport/DispatcherSupport.vue'
          ),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.dispatcher_support',
    },
  },
  {
    parentKey: 'notifyManagement',
    key: 'notifyManagement.senderSupport',
    index: 100,
    display: {
      '': {
        label: '发送器支持',
      },
      elementPlus: {
        label: '发送器支持',
      },
      simple: {
        label: '发送器支持',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'notify-settings/sender-support',
      component: {
        '': () =>
          import('@/views/nodes/elementPlus/notifyManagement/senderSupport/SenderSupport.vue'),
        elementPlus: () =>
          import('@/views/nodes/elementPlus/notifyManagement/senderSupport/SenderSupport.vue'),
        simple: () =>
          import('@/views/nodes/elementPlus/notifyManagement/senderSupport/SenderSupport.vue'),
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.notify_management.sender_support',
    },
  },
]

/**
 * 提供 NavigationNodeSetting。
 */
function provideNavigationNodeSettings(): NavigationNodeSetting[] {
  return navigationNodes
}

export default vimNavigationModule
