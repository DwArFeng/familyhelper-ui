// noinspection JSUnusedGlobalSymbols,DuplicatedCode

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
    key: 'about',
    index: 9000,
    display: {
      label: '关于',
    },
    menu: {
      shown: true,
    },
    router: {
      required: true,
      path: 'about',
      component: () => import('@/views/nodes/about/About.vue'),
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
