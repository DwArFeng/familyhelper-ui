// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * 节点设置数组。
 */
const nodeSettings: NodeSetting[] = [
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
      node: 'ui.pc;ui.pc.menu_visible.notify_management',
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
        key: 'notifyManagement.notification',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.notification',
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
        key: 'notifyManagement.notifySetting',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.notify_setting',
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
        key: 'notifyManagement.topic',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.topic',
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
        key: 'notifyManagement.metaIndicator',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.meta_indicator',
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
        key: 'notifyManagement.meta',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.meta',
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
        key: 'notifyManagement.senderInfo',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.sender_info',
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
        key: 'notifyManagement.notifyHistory',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.notify_history',
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
        key: 'notifyManagement.routerSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.router_support',
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
        key: 'notifyManagement.dispatcherSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.dispatcher_support',
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
        key: 'notifyManagement.senderSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.notify_management.sender_support',
    },
  },
]

/**
 * 提供 NodeSetting。
 */
function provideNodeSettings(): NodeSetting[] {
  return nodeSettings
}

export default vimNavigationModule
