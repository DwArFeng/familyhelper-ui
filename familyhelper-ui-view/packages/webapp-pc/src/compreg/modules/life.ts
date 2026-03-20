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
    key: 'life.pbSet',
    component: {
      '': () => import('@/views/nodes/elementPlus/life/pbSet/PbSet.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/life/pbSet/PbSet.vue'),
      simple: () => import('@/views/nodes/elementPlus/life/pbSet/PbSet.vue'),
    },
  },
  {
    key: 'life.pbManagement',
    component: {
      '': () => import('@/views/nodes/elementPlus/life/pbManagement/PbManagement.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/life/pbManagement/PbManagement.vue'),
      simple: () => import('@/views/nodes/elementPlus/life/pbManagement/PbManagement.vue'),
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
