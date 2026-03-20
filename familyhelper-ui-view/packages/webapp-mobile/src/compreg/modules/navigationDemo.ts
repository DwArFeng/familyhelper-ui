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
    key: 'navigationDemo.subMenuItem1',
    component: {
      '': () => import('@/views/nodes/simple/welcome/Welcome.vue'),
      simple: () => import('@/views/nodes/simple/welcome/Welcome.vue'),
    },
  },
  {
    key: 'navigationDemo.subMenuItem2',
    component: {
      '': () => import('@/views/nodes/simple/welcome/Welcome.vue'),
      simple: () => import('@/views/nodes/simple/welcome/Welcome.vue'),
    },
  },
  {
    key: 'navigationDemo.subMenuItem3',
    component: {
      '': () => import('@/views/nodes/simple/welcome/Welcome.vue'),
      simple: () => import('@/views/nodes/simple/welcome/Welcome.vue'),
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
