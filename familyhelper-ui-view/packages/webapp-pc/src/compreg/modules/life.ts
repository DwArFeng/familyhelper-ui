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
    key: 'life.pbSet',
    name: '个人最佳集合',
    description: '个人最佳集合',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/life/pbSet/PbSet.vue'),
    },
  },
  {
    key: 'life.pbManagement',
    name: '个人最佳管理',
    description: '个人最佳管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/life/pbManagement/PbManagement.vue'),
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
