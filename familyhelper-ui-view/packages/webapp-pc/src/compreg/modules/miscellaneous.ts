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
    key: 'miscellaneous.compregFallback',
    component: {
      '': () => import('@/views/nodes/comvisual/miscellaneous/compregFallback/CompregFallback.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/miscellaneous/compregFallback/CompregFallback.vue'),
      elementPlus: () =>
        import('@/views/nodes/comvisual/miscellaneous/compregFallback/CompregFallback.vue'),
    },
  },
  {
    key: 'miscellaneous.fileEditor',
    component: {
      '': () => import('@/views/nodes/elementPlus/miscellaneous/fileEditor/FileEditor.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/miscellaneous/fileEditor/FileEditor.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/miscellaneous/fileEditor/FileEditor.vue'),
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
