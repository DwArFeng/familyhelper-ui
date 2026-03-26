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
      '': () => import('@/views/nodes/comvisual/CompregFallback.vue'),
      comvisual: () => import('@/views/nodes/comvisual/CompregFallback.vue'),
    },
  },
  {
    key: 'miscellaneous.externalLink',
    component: {
      '': () => import('@/views/nodes/comvisual/miscellaneous/externalLink/ExternalLink.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/miscellaneous/externalLink/ExternalLink.vue'),
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
