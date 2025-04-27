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
    key: 'navigationDemo',
    index: 100,
    display: {
      label: '导航演示',
    },
    menu: {
      shown: true,
    },
    router: {
      required: true,
      path: 'welcome',
      component: () => import('@/views/nodes/welcome/Welcome.vue'),
    },
    permission: {
      required: false,
    },
  },
  {
    parentKey: 'navigationDemo',
    key: 'navigationDemo.subMenuItem1',
    index: 10,
    display: {
      label: '子菜单1',
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      affix: false,
      affixIndex: 0,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'welcome',
      component: () => import('@/views/nodes/welcome/Welcome.vue'),
    },
    permission: {
      required: false,
    },
  },
  {
    parentKey: 'navigationDemo',
    key: 'navigationDemo.subMenuItem2',
    index: 20,
    display: {
      label: '子菜单2',
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      affix: false,
      affixIndex: 0,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'welcome',
      component: () => import('@/views/nodes/welcome/Welcome.vue'),
    },
    permission: {
      required: false,
    },
  },
  {
    parentKey: 'navigationDemo',
    key: 'navigationDemo.subMenuItem3',
    index: 30,
    display: {
      label: '子菜单3',
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      affix: false,
      affixIndex: 0,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'welcome',
      component: () => import('@/views/nodes/welcome/Welcome.vue'),
    },
    permission: {
      required: false,
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
