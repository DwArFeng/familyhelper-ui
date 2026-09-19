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
    key: 'auditManagement.auditCategory',
    name: '审计类别',
    description: '审计类别',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/auditManagement/auditCategory/AuditCategory.vue'),
    },
  },
  {
    key: 'auditManagement.auditEntry',
    name: '审计记录',
    description: '审计记录',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/auditManagement/auditEntry/AuditEntry.vue'),
    },
  },
  {
    key: 'auditManagement.inspection',
    name: '巡检设置',
    description: '巡检设置',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/auditManagement/inspection/Inspection.vue'),
    },
  },
  {
    key: 'auditManagement.inspectionTask',
    name: '巡检任务',
    description: '巡检任务',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/auditManagement/inspectionTask/InspectionTask.vue'),
    },
  },
  {
    key: 'auditManagement.inspectionAlarm',
    name: '巡检告警',
    description: '巡检告警',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/auditManagement/inspectionAlarm/InspectionAlarm.vue'),
    },
  },
  {
    key: 'auditManagement.inspectionAlarmTypeIndicator',
    name: '告警类型',
    description: '告警类型',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/auditManagement/inspectionAlarmTypeIndicator/InspectionAlarmTypeIndicator.vue'),
    },
  },
  {
    key: 'auditManagement.inspectorSupport',
    name: '检查器支持',
    description: '检查器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/auditManagement/inspectorSupport/InspectorSupport.vue'),
    },
  },
  {
    key: 'auditManagement.inspectionDriverSupport',
    name: '巡检驱动支持',
    description: '巡检驱动支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/auditManagement/inspectionDriverSupport/InspectionDriverSupport.vue'),
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
