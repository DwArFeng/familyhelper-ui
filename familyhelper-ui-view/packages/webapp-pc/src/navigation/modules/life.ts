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
    key: 'life',
    index: 120,
    display: {
      '': {
        label: '日常生活',
      },
      elementPlus: {
        label: '日常生活',
      },
      simple: {
        label: '日常生活',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.life',
    },
  },
  {
    parentKey: 'life',
    key: 'life.pbSet',
    index: 0,
    display: {
      '': {
        label: '个人最佳集合',
      },
      elementPlus: {
        label: '个人最佳集合',
      },
      simple: {
        label: '个人最佳集合',
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
      path: 'life/pb-set',
      component: {
        key: 'life.pbSet',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.life.pb_set',
    },
  },
  {
    parentKey: 'life',
    key: 'life.pbManagement',
    index: 10,
    display: {
      '': {
        label: '个人最佳管理',
      },
      elementPlus: {
        label: '个人最佳管理',
      },
      simple: {
        label: '个人最佳管理',
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
      path: 'life/pb-management',
      component: {
        key: 'life.pbManagement',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.life.pb_management',
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
