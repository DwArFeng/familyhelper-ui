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
    key: 'welcome',
    index: 0,
    display: {
      label: '首页',
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
      component: () => import('@/views/items/welcome/Welcome.vue'),
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

// 该导出语句通过 import.meta.glob 被动态导入，故忽略相关警告。
// noinspection JSUnusedGlobalSymbols
export default vimNavigationModule
