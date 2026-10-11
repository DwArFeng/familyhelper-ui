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
    key: 'fileio',
    index: 125,
    display: {
      '': {
        label: '文件IO',
      },
      comvisual: {
        label: '文件IO',
      },
      elementPlus: {
        label: '文件IO',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.importTaskSetting',
    index: 10,
    display: {
      '': {
        label: '导入设置',
      },
      comvisual: {
        label: '导入设置',
      },
      elementPlus: {
        label: '导入设置',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.import_task_setting',
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
      path: 'fileio/import-task-setting',
      component: {
        key: 'fileio.importTaskSetting',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.import_task_setting',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.exportTaskSetting',
    index: 20,
    display: {
      '': {
        label: '导出设置',
      },
      comvisual: {
        label: '导出设置',
      },
      elementPlus: {
        label: '导出设置',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.export_task_setting',
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
      path: 'fileio/export-task-setting',
      component: {
        key: 'fileio.exportTaskSetting',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.export_task_setting',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.importTask',
    index: 30,
    display: {
      '': {
        label: '导入任务',
      },
      comvisual: {
        label: '导入任务',
      },
      elementPlus: {
        label: '导入任务',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.import_task',
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
      path: 'fileio/import-task',
      component: {
        key: 'fileio.importTask',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.import_task',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.exportTask',
    index: 40,
    display: {
      '': {
        label: '导出任务',
      },
      comvisual: {
        label: '导出任务',
      },
      elementPlus: {
        label: '导出任务',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.export_task',
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
      path: 'fileio/export-task',
      component: {
        key: 'fileio.exportTask',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.export_task',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.myImportTask',
    index: 50,
    display: {
      '': {
        label: '我的导入任务',
      },
      comvisual: {
        label: '我的导入任务',
      },
      elementPlus: {
        label: '我的导入任务',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.my_import_task',
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
      path: 'fileio/my-import-task',
      component: {
        key: 'fileio.myImportTask',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.my_import_task',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.myExportTask',
    index: 60,
    display: {
      '': {
        label: '我的导出任务',
      },
      comvisual: {
        label: '我的导出任务',
      },
      elementPlus: {
        label: '我的导出任务',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.my_export_task',
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
      path: 'fileio/my-export-task',
      component: {
        key: 'fileio.myExportTask',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.my_export_task',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.importerSupport',
    index: 70,
    display: {
      '': {
        label: '导入器支持',
      },
      comvisual: {
        label: '导入器支持',
      },
      elementPlus: {
        label: '导入器支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.importer_support',
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
      path: 'fileio/importer-support',
      component: {
        key: 'fileio.importerSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.importer_support',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.exporterSupport',
    index: 80,
    display: {
      '': {
        label: '导出器支持',
      },
      comvisual: {
        label: '导出器支持',
      },
      elementPlus: {
        label: '导出器支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.exporter_support',
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
      path: 'fileio/exporter-support',
      component: {
        key: 'fileio.exporterSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.exporter_support',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.readerSupport',
    index: 90,
    display: {
      '': {
        label: '读取器支持',
      },
      comvisual: {
        label: '读取器支持',
      },
      elementPlus: {
        label: '读取器支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.reader_support',
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
      path: 'fileio/reader-support',
      component: {
        key: 'fileio.readerSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.reader_support',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.writerSupport',
    index: 100,
    display: {
      '': {
        label: '写入器支持',
      },
      comvisual: {
        label: '写入器支持',
      },
      elementPlus: {
        label: '写入器支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.writer_support',
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
      path: 'fileio/writer-support',
      component: {
        key: 'fileio.writerSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.writer_support',
    },
  },
  {
    parentKey: 'fileio',
    key: 'fileio.exportTaskPanel',
    index: 110,
    display: {
      '': {
        label: '导出任务面板',
      },
      comvisual: {
        label: '导出任务面板',
      },
      elementPlus: {
        label: '导出任务面板',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.fileio.export_task_panel',
      },
    },
    menu: {
      shown: false,
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
      path: 'fileio/export-task-panel',
      component: {
        key: 'fileio.exportTaskPanel',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.fileio.export_task_panel',
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
