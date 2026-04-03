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
    key: 'developerTools.visualizerSettings',
    index: 10,
    display: {
      '': {
        label: '可视化器设置',
      },
      comvisual: {
        label: '可视化器设置',
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
      path: 'developer-tools/visualizer-settings',
      component: {
        key: 'developerTools.visualizerSettings',
      },
    },
    permission: {
      required: true,
      node: 'ui.mobile;ui.mobile.menu_visible.developer_tools.visualizer_settings',
    },
  },
  {
    parentKey: 'developerTools',
    key: 'developerTools.navigation',
    index: 20,
    display: {
      '': {
        label: '导航管理',
      },
      comvisual: {
        label: '导航管理',
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
      path: 'developer-tools/navigation',
      component: {
        key: 'developerTools.navigation',
      },
    },
    permission: {
      required: true,
      node: 'ui.mobile;ui.mobile.menu_visible.developer_tools.navigation',
    },
  },
  {
    parentKey: 'developerTools',
    key: 'developerTools.navigationSettings',
    index: 30,
    display: {
      '': {
        label: '导航设置',
      },
      comvisual: {
        label: '导航设置',
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
      path: 'developer-tools/navigation-settings',
      component: {
        key: 'developerTools.navigationSettings',
      },
    },
    permission: {
      required: true,
      node: 'ui.mobile;ui.mobile.menu_visible.developer_tools.navigation_settings',
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
  {
    parentKey: 'developerTools',
    key: 'developerTools.compregSupport',
    index: 910,
    display: {
      '': {
        label: '组件注册支持',
      },
      comvisual: {
        label: '组件注册支持',
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
      path: 'developer-tools/compreg-support',
      component: {
        key: 'developerTools.compregSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.mobile;ui.mobile.menu_visible.developer_tools.compreg_support',
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
