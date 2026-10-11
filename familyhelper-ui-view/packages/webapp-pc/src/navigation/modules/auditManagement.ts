// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * 节点设置数组。
 */
const nodeSettings: NodeSetting[] = [
  {
    parentKey: null,
    key: 'auditManagement',
    index: 145,
    display: {
      '': {
        label: '审计管理',
      },
      comvisual: {
        label: '审计管理',
      },
      elementPlus: {
        label: '审计管理',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management',
    },
  },
  {
    parentKey: 'auditManagement',
    key: 'auditManagement.auditCategory',
    index: 10,
    display: {
      '': {
        label: '审计类别',
      },
      comvisual: {
        label: '审计类别',
      },
      elementPlus: {
        label: '审计类别',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management.audit_category',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'audit-management/audit-category',
      component: {
        key: 'auditManagement.auditCategory',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management.audit_category',
    },
  },
  {
    parentKey: 'auditManagement',
    key: 'auditManagement.inspection',
    index: 20,
    display: {
      '': {
        label: '巡检设置',
      },
      comvisual: {
        label: '巡检设置',
      },
      elementPlus: {
        label: '巡检设置',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management.inspection',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'audit-management/inspection',
      component: {
        key: 'auditManagement.inspection',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management.inspection',
    },
  },
  {
    parentKey: 'auditManagement',
    key: 'auditManagement.inspectionAlarmTypeIndicator',
    index: 30,
    display: {
      '': {
        label: '告警类型',
      },
      comvisual: {
        label: '告警类型',
      },
      elementPlus: {
        label: '告警类型',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management.inspection_alarm_type_indicator',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'audit-management/inspection-alarm-type-indicator',
      component: {
        key: 'auditManagement.inspectionAlarmTypeIndicator',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management.inspection_alarm_type_indicator',
    },
  },
  {
    parentKey: 'auditManagement',
    key: 'auditManagement.auditEntry',
    index: 40,
    display: {
      '': {
        label: '审计记录',
      },
      comvisual: {
        label: '审计记录',
      },
      elementPlus: {
        label: '审计记录',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management.audit_entry',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'audit-management/audit-entry',
      component: {
        key: 'auditManagement.auditEntry',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management.audit_entry',
    },
  },
  {
    parentKey: 'auditManagement',
    key: 'auditManagement.inspectionTask',
    index: 50,
    display: {
      '': {
        label: '巡检任务',
      },
      comvisual: {
        label: '巡检任务',
      },
      elementPlus: {
        label: '巡检任务',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management.inspection_task',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'audit-management/inspection-task',
      component: {
        key: 'auditManagement.inspectionTask',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management.inspection_task',
    },
  },
  {
    parentKey: 'auditManagement',
    key: 'auditManagement.inspectionAlarm',
    index: 60,
    display: {
      '': {
        label: '巡检告警',
      },
      comvisual: {
        label: '巡检告警',
      },
      elementPlus: {
        label: '巡检告警',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management.inspection_alarm',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'audit-management/inspection-alarm',
      component: {
        key: 'auditManagement.inspectionAlarm',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management.inspection_alarm',
    },
  },
  {
    parentKey: 'auditManagement',
    key: 'auditManagement.inspectorSupport',
    index: 70,
    display: {
      '': {
        label: '检查器支持',
      },
      comvisual: {
        label: '检查器支持',
      },
      elementPlus: {
        label: '检查器支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management.inspector_support',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'audit-management/inspector-support',
      component: {
        key: 'auditManagement.inspectorSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management.inspector_support',
    },
  },
  {
    parentKey: 'auditManagement',
    key: 'auditManagement.inspectionDriverSupport',
    index: 80,
    display: {
      '': {
        label: '巡检驱动支持',
      },
      comvisual: {
        label: '巡检驱动支持',
      },
      elementPlus: {
        label: '巡检驱动支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.audit_management.inspection_driver_support',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'audit-management/inspection-driver-support',
      component: {
        key: 'auditManagement.inspectionDriverSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.audit_management.inspection_driver_support',
    },
  },
]

/**
 * 提供 NodeSetting。
 */
function provideNodeSettings(): NodeSetting[] {
  return nodeSettings
}

export default vimNavigationModule
