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
    key: 'about',
    index: 9000,
    display: {
      '': {
        label: '关于',
      },
      comvisual: {
        label: '关于',
      },
      elementPlus: {
        label: '关于',
      },
    },
    menu: {
      shown: true,
    },
    router: {
      required: true,
      path: 'about',
      component: {
        key: 'about',
      },
    },
    permission: {
      required: false,
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
