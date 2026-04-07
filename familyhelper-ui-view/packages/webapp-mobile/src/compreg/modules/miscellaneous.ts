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
    name: '组件注册回退',
    description: '组件注册回退',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () =>
        Promise.resolve(
          comvisualPlaceholder(
            '当你看到这个页面的时候，意味着 router.component.key 没有被正确配置',
          ),
        ),
      comvisual: () =>
        Promise.resolve(
          comvisualPlaceholder(
            '当你看到这个页面的时候，意味着 router.component.key 没有被正确配置',
          ),
        ),
    },
  },
  {
    key: 'miscellaneous.externalLink',
    name: '外链',
    description: '外链',
    exampleRouterComponentParam: {
      '': { src: 'http://info.cern.ch/' },
      comvisual: { src: 'http://info.cern.ch/' },
    },
    component: {
      '': () => import('@/views/nodes/comvisual/miscellaneous/externalLink/ExternalLink.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/miscellaneous/externalLink/ExternalLink.vue'),
    },
  },
  {
    key: 'miscellaneous.text',
    name: '文本',
    description: '在页面中间以占位符的形式显示一段文本，用于提示相关信息或调试',
    exampleRouterComponentParam: {
      '': { content: '这是一段测试文本' },
      comvisual: { content: '这是一段测试文本' },
    },
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
