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
      comvisual: {
        label: '杂项',
      },
      elementPlus: {
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
      comvisual: {
        label: '文件编辑器',
      },
      elementPlus: {
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
  {
    parentKey: 'miscellaneous',
    key: 'miscellaneous.externalLink',
    index: 20,
    display: {
      '': {
        label: '外链',
      },
      comvisual: {
        label: '外链',
      },
      elementPlus: {
        label: '外链',
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
      path: 'miscellaneous/external-link',
      component: {
        key: 'miscellaneous.externalLink',
      },
    },
  },
  {
    parentKey: 'miscellaneous',
    key: 'miscellaneous.text',
    index: 30,
    display: {
      '': {
        label: '文本',
      },
      comvisual: {
        label: '文本',
      },
      elementPlus: {
        label: '文本',
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
      path: 'miscellaneous/text',
      component: {
        key: 'miscellaneous.text',
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
