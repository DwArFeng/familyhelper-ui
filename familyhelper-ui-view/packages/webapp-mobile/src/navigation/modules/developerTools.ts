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
    key: 'developerTools',
    index: 8900,
    display: {
      '': {
        label: '开发者工具',
      },
      comvisual: {
        label: '开发者工具',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.mobile;ui.mobile.menu_visible.developer_tools',
    },
  },
  {
    parentKey: 'developerTools',
    key: 'developerTools.visualizerSupport',
    index: 900,
    display: {
      '': {
        label: '可视化器支持',
      },
      comvisual: {
        label: '可视化器支持',
      },
      elementPlus: {
        label: '可视化器支持',
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
      path: 'developer-tools/visualizer-support',
      component: {
        key: 'developerTools.visualizerSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.mobile;ui.mobile.menu_visible.developer_tools.visualizer_support',
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
