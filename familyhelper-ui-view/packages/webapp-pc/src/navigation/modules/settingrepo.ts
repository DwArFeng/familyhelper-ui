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
    key: 'settingrepo',
    index: 135,
    display: {
      '': {
        label: '配置仓库',
      },
      comvisual: {
        label: '配置仓库',
      },
      elementPlus: {
        label: '配置仓库',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.settingrepo',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.settingCategory',
    index: 10,
    display: {
      '': {
        label: '配置类型管理',
      },
      comvisual: {
        label: '配置类型管理',
      },
      elementPlus: {
        label: '配置类型管理',
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
      path: 'settingrepo/setting-category',
      component: {
        key: 'settingrepo.settingCategory',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.settingrepo.setting_category',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.settingNode',
    index: 20,
    display: {
      '': {
        label: '配置节点管理',
      },
      comvisual: {
        label: '配置节点管理',
      },
      elementPlus: {
        label: '配置节点管理',
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
      path: 'settingrepo/setting-node',
      component: {
        key: 'settingrepo.settingNode',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.settingrepo.setting_node',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.formatterSupport',
    index: 30,
    display: {
      '': {
        label: '格式化器支持',
      },
      comvisual: {
        label: '格式化器支持',
      },
      elementPlus: {
        label: '格式化器支持',
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
      path: 'settingrepo/formatter-support',
      component: {
        key: 'settingrepo.formatterSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.settingrepo.formatter_support',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.settingNodeEditor',
    index: 40,
    display: {
      '': {
        label: '配置节点编辑器',
      },
      comvisual: {
        label: '配置节点编辑器',
      },
      elementPlus: {
        label: '配置节点编辑器',
      },
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
      path: 'settingrepo/setting-node-editor',
      component: {
        key: 'settingrepo.settingNodeEditor',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.settingrepo.setting_node_editor',
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
