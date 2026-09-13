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
    key: 'fileio.importTaskSetting',
    name: '导入设置',
    description: '导入设置',
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
        import('@/views/nodes/elementPlus/fileio/importTaskSetting/ImportTaskSetting.vue'),
    },
  },
  {
    key: 'fileio.exportTaskSetting',
    name: '导出设置',
    description: '导出设置',
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
        import('@/views/nodes/elementPlus/fileio/exportTaskSetting/ExportTaskSetting.vue'),
    },
  },
  {
    key: 'fileio.importTask',
    name: '导入任务',
    description: '导入任务',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/fileio/importTask/ImportTask.vue'),
    },
  },
  {
    key: 'fileio.exportTask',
    name: '导出任务',
    description: '导出任务',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/fileio/exportTask/ExportTask.vue'),
    },
  },
  {
    key: 'fileio.myImportTask',
    name: '我的导入任务',
    description: '我的导入任务',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/fileio/myImportTask/MyImportTask.vue'),
    },
  },
  {
    key: 'fileio.myExportTask',
    name: '我的导出任务',
    description: '我的导出任务',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/fileio/myExportTask/MyExportTask.vue'),
    },
  },
  {
    key: 'fileio.importerSupport',
    name: '导入器支持',
    description: '导入器支持',
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
        import('@/views/nodes/elementPlus/fileio/importerSupport/ImporterSupport.vue'),
    },
  },
  {
    key: 'fileio.exporterSupport',
    name: '导出器支持',
    description: '导出器支持',
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
        import('@/views/nodes/elementPlus/fileio/exporterSupport/ExporterSupport.vue'),
    },
  },
  {
    key: 'fileio.readerSupport',
    name: '读取器支持',
    description: '读取器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/fileio/readerSupport/ReaderSupport.vue'),
    },
  },
  {
    key: 'fileio.writerSupport',
    name: '写入器支持',
    description: '写入器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => Promise.resolve(comvisualPlaceholder('该组件无法在默认可视化器下展示')),
      comvisual: () =>
        Promise.resolve(comvisualPlaceholder('该组件无法在 comvisual 可视化器下展示')),
      elementPlus: () => import('@/views/nodes/elementPlus/fileio/writerSupport/WriterSupport.vue'),
    },
  },
  {
    key: 'fileio.exportTaskPanel',
    name: '导出任务面板',
    description: '导出任务面板',
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
        import('@/views/nodes/elementPlus/fileio/exportTaskPanel/ExportTaskPanel.vue'),
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
