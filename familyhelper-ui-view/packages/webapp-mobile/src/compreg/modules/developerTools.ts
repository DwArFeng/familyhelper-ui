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
    key: 'developerTools.visualizerSupport',
    name: '可视化器支持',
    description: '可视化器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () =>
        import('@/views/nodes/comvisual/developerTools/visualizerSupport/VisualizerSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/developerTools/visualizerSupport/VisualizerSupport.vue'),
    },
  },
  {
    key: 'developerTools.compregSupport',
    name: '组件注册',
    description: '组件注册',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () => import('@/views/nodes/comvisual/developerTools/compregSupport/CompregSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/developerTools/compregSupport/CompregSupport.vue'),
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
