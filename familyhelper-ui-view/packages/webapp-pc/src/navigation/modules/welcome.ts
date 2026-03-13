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
    key: 'welcome',
    index: 0,
    display: {
      '': {
        label: '首页',
      },
      elementPlus: {
        label: '首页',
      },
      simple: {
        label: '首页',
      },
    },
    menu: {
      shown: false,
    },
    ezNav: {
      shown: true,
      affix: true,
      affixIndex: 0,
    },
    router: {
      required: true,
      path: 'welcome',
      component: {
        '': () => import('@/views/nodes/elementPlus/welcome/Welcome.vue'),
        elementPlus: () => import('@/views/nodes/elementPlus/welcome/Welcome.vue'),
        simple: () => import('@/views/nodes/elementPlus/welcome/Welcome.vue'),
      },
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
