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
    key: 'welcome',
    name: '首页',
    description: '首页',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => import('@/views/nodes/elementPlus/welcome/Welcome.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/welcome/Welcome.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/welcome/Welcome.vue'),
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
