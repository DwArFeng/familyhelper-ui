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
    key: 'miscellaneous.compregFallback',
    component: {
      '': () =>
        comvisualPlaceholder('当你看到这个页面的时候，意味着 router.component.key 没有被正确配置'),
      comvisual: () =>
        comvisualPlaceholder('当你看到这个页面的时候，意味着 router.component.key 没有被正确配置'),
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
  {
    key: 'miscellaneous.text',
    component: {
      '': () => import('@/views/nodes/comvisual/miscellaneous/text/Text.vue'),
      comvisual: () => import('@/views/nodes/comvisual/miscellaneous/text/Text.vue'),
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
