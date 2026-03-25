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
    key: 'settingrepo.settingCategory',
    component: {
      '': () => import('@/views/nodes/elementPlus/settingrepo/settingCategory/SettingCategory.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/settingrepo/settingCategory/SettingCategory.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/settingrepo/settingCategory/SettingCategory.vue'),
    },
  },
  {
    key: 'settingrepo.settingNode',
    component: {
      '': () => import('@/views/nodes/elementPlus/settingrepo/settingNode/SettingNode.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/settingrepo/settingNode/SettingNode.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/settingrepo/settingNode/SettingNode.vue'),
    },
  },
  {
    key: 'settingrepo.formatterSupport',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/settingrepo/formatterSupport/FormatterSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/settingrepo/formatterSupport/FormatterSupport.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/settingrepo/formatterSupport/FormatterSupport.vue'),
    },
  },
  {
    key: 'settingrepo.settingNodeEditor',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/settingrepo/settingNodeEditor/SettingNodeEditor.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/settingrepo/settingNodeEditor/SettingNodeEditor.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/settingrepo/settingNodeEditor/SettingNodeEditor.vue'),
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
