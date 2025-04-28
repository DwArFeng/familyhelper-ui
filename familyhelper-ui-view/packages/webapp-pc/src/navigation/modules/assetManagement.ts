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
    key: 'assetsManagement',
    index: 20,
    display: {
      label: '资产管理',
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
      label: '资产目录管理',
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
      component: () => import('@/views/nodes/assetsManagement/assetCatalog/AssetCatalog.vue'),
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
      label: '资产BOM管理',
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
      component: () => import('@/views/nodes/assetsManagement/assetBom/AssetBom.vue'),
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
      label: '项目类型管理',
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
      component: () =>
        import('@/views/nodes/assetsManagement/itemTypeIndicator/ItemTypeIndicator.vue'),
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
      label: '项目标签管理',
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
      component: () => import('@/views/nodes/assetsManagement/itemLabel/ItemLabel.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.assets_management.item_label',
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
