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
    name: '配置类型管理',
    description: '配置类型管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '配置节点管理',
    description: '配置节点管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => import('@/views/nodes/elementPlus/settingrepo/settingNode/SettingNode.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/settingrepo/settingNode/SettingNode.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/settingrepo/settingNode/SettingNode.vue'),
    },
  },
  {
    key: 'settingrepo.formatterSupport',
    name: '格式化器支持',
    description: '格式化器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
    name: '配置节点编辑器',
    description: '配置节点编辑器',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
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
