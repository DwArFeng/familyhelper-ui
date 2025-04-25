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
    key: 'settingrepo',
    index: 135,
    display: {
      label: '配置仓库',
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.settingrepo',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.settingCategory',
    index: 10,
    display: {
      label: '配置类型管理',
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
      component: () => import('@/views/nodes/settingrepo/settingCategory/SettingCategory.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.settingrepo.setting_category',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.settingNode',
    index: 20,
    display: {
      label: '配置节点管理',
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
      component: () => import('@/views/nodes/settingrepo/settingNode/SettingNode.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.settingrepo.setting_node',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.formatterSupport',
    index: 30,
    display: {
      label: '格式化器支持',
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
      component: () => import('@/views/nodes/settingrepo/formatterSupport/FormatterSupport.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.settingrepo.formatter_support',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.settingNodeEditor',
    index: 40,
    display: {
      label: '配置节点编辑器',
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
      component: () => import('@/views/nodes/settingrepo/settingNodeEditor/SettingNodeEditor.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.settingrepo.setting_node_editor',
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
