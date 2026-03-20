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
    key: 'miscellaneous',
    index: 150,
    display: {
      '': {
        label: '杂项',
      },
      elementPlus: {
        label: '杂项',
      },
      simple: {
        label: '杂项',
      },
    },
  },
  {
    parentKey: 'miscellaneous',
    key: 'miscellaneous.fileEditor',
    index: 10,
    display: {
      '': {
        label: '文件编辑器',
      },
      elementPlus: {
        label: '文件编辑器',
      },
      simple: {
        label: '文件编辑器',
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
      path: 'miscellaneous/file-editor',
      component: {
        key: 'miscellaneous.fileEditor',
      },
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
