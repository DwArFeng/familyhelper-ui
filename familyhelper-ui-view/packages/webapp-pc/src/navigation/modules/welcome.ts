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
    key: 'welcome',
    index: 0,
    display: {
      '': {
        label: '首页',
      },
      comvisual: {
        label: '首页',
      },
      elementPlus: {
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
        key: 'welcome',
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
