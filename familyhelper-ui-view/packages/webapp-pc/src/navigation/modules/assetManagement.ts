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
    key: 'assetsManagement',
    index: 20,
    display: {
      '': {
        label: '资产管理',
      },
      elementPlus: {
        label: '资产管理',
      },
      simple: {
        label: '资产管理',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.assets_management',
    },
  },
  {
    parentKey: 'assetsManagement',
    key: 'assetsManagement.assetCatalog',
    index: 10,
    display: {
      '': {
        label: '资产目录管理',
      },
      elementPlus: {
        label: '资产目录管理',
      },
      simple: {
        label: '资产目录管理',
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
      path: 'assets-management/asset-catalog',
      component: {
        key: 'assetsManagement.assetCatalog',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.assets_management.assets_catalog',
    },
  },
  {
    parentKey: 'assetsManagement',
    key: 'assetsManagement.assetBom',
    index: 20,
    display: {
      '': {
        label: '资产BOM管理',
      },
      elementPlus: {
        label: '资产BOM管理',
      },
      simple: {
        label: '资产BOM管理',
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
      path: 'assets-management/asset-bom',
      component: {
        key: 'assetsManagement.assetBom',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.assets_management.assets_bom',
    },
  },
  {
    parentKey: 'assetsManagement',
    key: 'assetsManagement.itemTypeIndicator',
    index: 30,
    display: {
      '': {
        label: '项目类型管理',
      },
      elementPlus: {
        label: '项目类型管理',
      },
      simple: {
        label: '项目类型管理',
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
      path: 'assets-management/item-type-indicator',
      component: {
        key: 'assetsManagement.itemTypeIndicator',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.assets_management.item_type_indicator',
    },
  },
  {
    parentKey: 'assetsManagement',
    key: 'assetsManagement.itemLabel',
    index: 40,
    display: {
      '': {
        label: '项目标签管理',
      },
      elementPlus: {
        label: '项目标签管理',
      },
      simple: {
        label: '项目标签管理',
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
      path: 'assets-management/item-label',
      component: {
        key: 'assetsManagement.itemLabel',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.assets_management.item_label',
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
