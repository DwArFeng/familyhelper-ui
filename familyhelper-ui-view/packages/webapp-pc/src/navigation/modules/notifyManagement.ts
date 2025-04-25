import type { NavigationNodeSetting, VimNavigationModule } from '@/navigation/types.ts'

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
      label: '通知管理',
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
      label: '通知接收',
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
      component: () => import('@/views/nodes/notifyManagement/notification/Notification.vue'),
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
      label: '通知设置',
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
      component: () => import('@/views/nodes/notifyManagement/notifySetting/NotifySetting.vue'),
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
      label: '主题设置',
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
      component: () => import('@/views/nodes/notifyManagement/topic/Topic.vue'),
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
      label: '元数据指示器',
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
      component: () =>
        import('@/views/nodes/notifyManagement/metaIndicator/subPanels/MetaIndicator.vue'),
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
      label: '元数据管理',
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
      component: () => import('@/views/nodes/notifyManagement/meta/Meta.vue'),
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
      label: '发送器设置',
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
      component: () => import('@/views/nodes/notifyManagement/senderInfo/SenderInfo.vue'),
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
      label: '通知历史',
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
      component: () => import('@/views/nodes/notifyManagement/notifyHistory/NotifyHistory.vue'),
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
      label: '路由器支持',
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
      component: () => import('@/views/nodes/notifyManagement/routerSupport/RouterSupport.vue'),
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
      label: '调度器支持',
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
      component: () =>
        import('@/views/nodes/notifyManagement/dispatcherSupport/DispatcherSupport.vue'),
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
      label: '发送器支持',
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
      component: () => import('@/views/nodes/notifyManagement/senderSupport/SenderSupport.vue'),
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

// 该导出语句通过 import.meta.glob 被动态导入，故忽略相关警告。
// noinspection JSUnusedGlobalSymbols
export default vimNavigationModule
