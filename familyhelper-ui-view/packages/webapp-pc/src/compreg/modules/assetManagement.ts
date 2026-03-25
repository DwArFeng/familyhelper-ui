// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type ComponentSetting, type VimCompregModule } from '@/compreg/types.ts'

/**
 * VIM Compreg 模块。
 */
const vimCompregModule: VimCompregModule = {
  init,
  provideComponentSettings: provideCompregSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * Compreg 设置数组。
 */
const compregSettings: ComponentSetting[] = [
  {
    key: 'assetsManagement.assetCatalog',
    component: {
      '': () => import('@/views/nodes/elementPlus/assetsManagement/assetCatalog/AssetCatalog.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/assetsManagement/assetCatalog/AssetCatalog.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/assetsManagement/assetCatalog/AssetCatalog.vue'),
    },
  },
  {
    key: 'assetsManagement.assetBom',
    component: {
      '': () => import('@/views/nodes/elementPlus/assetsManagement/assetBom/AssetBom.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/assetsManagement/assetBom/AssetBom.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/assetsManagement/assetBom/AssetBom.vue'),
    },
  },
  {
    key: 'assetsManagement.itemTypeIndicator',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/assetsManagement/itemTypeIndicator/ItemTypeIndicator.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/assetsManagement/itemTypeIndicator/ItemTypeIndicator.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/assetsManagement/itemTypeIndicator/ItemTypeIndicator.vue'),
    },
  },
  {
    key: 'assetsManagement.itemLabel',
    component: {
      '': () => import('@/views/nodes/elementPlus/assetsManagement/itemLabel/ItemLabel.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/assetsManagement/itemLabel/ItemLabel.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/assetsManagement/itemLabel/ItemLabel.vue'),
    },
  },
]

/**
 * 提供 ComponentSetting。
 */
function provideCompregSettings(): ComponentSetting[] {
  return compregSettings
}

export default vimCompregModule
