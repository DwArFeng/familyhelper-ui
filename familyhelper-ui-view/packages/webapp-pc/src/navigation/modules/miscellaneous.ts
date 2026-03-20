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
 * 提供 NodeSetting。
 */
function provideNodeSettings(): NodeSetting[] {
  return nodeSettings
}

export default vimNavigationModule
