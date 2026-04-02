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
    key: 'note.noteBook',
    name: '笔记本',
    description: '笔记本',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => import('@/views/nodes/elementPlus/note/noteBook/NoteBook.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/note/noteBook/NoteBook.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/note/noteBook/NoteBook.vue'),
    },
  },
  {
    key: 'note.noteManagement',
    name: '笔记管理',
    description: '笔记管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
      elementPlus: {},
    },
    component: {
      '': () => import('@/views/nodes/elementPlus/note/noteManagement/NoteManagement.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/note/noteManagement/NoteManagement.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/note/noteManagement/NoteManagement.vue'),
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
