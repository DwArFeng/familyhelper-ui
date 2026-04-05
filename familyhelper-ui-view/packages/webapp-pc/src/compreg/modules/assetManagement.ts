// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type ComponentSetting, type VimCompregModule } from '@/compreg/types.ts'

import { placeholder as comvisualPlaceholder } from '@/views/nodes/comvisual/hyperscript/placeholder/index.ts'

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
    name: '资产目录管理',
    description: '资产目录管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/assetsManagement/assetCatalog/AssetCatalog.vue'),
    },
  },
  {
    key: 'assetsManagement.assetBom',
    name: '资产BOM管理',
    description: '资产BOM管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/assetsManagement/assetBom/AssetBom.vue'),
    },
  },
  {
    key: 'assetsManagement.itemTypeIndicator',
    name: '项目类型管理',
    description: '项目类型管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/assetsManagement/itemTypeIndicator/ItemTypeIndicator.vue'),
    },
  },
  {
    key: 'assetsManagement.itemLabel',
    name: '项目标签管理',
    description: '项目标签管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
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
