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
    key: 'miscellaneous',
    index: 150,
    display: {
      label: '杂项',
    },
  },
  {
    parentKey: 'miscellaneous',
    key: 'miscellaneous.fileEditor',
    index: 10,
    display: {
      label: '文件编辑器',
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
      path: 'miscellaneous/file-editor',
      component: () => import('@/views/items/miscellaneous/fileEditor/FileEditor.vue'),
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
