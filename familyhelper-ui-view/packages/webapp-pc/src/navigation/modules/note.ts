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
    key: 'note',
    index: 110,
    display: {
      '': {
        label: '学习笔记',
      },
      comvisual: {
        label: '学习笔记',
      },
      elementPlus: {
        label: '学习笔记',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.note',
    },
  },
  {
    parentKey: 'note',
    key: 'note.noteBook',
    index: 10,
    display: {
      '': {
        label: '笔记本',
      },
      comvisual: {
        label: '笔记本',
      },
      elementPlus: {
        label: '笔记本',
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
      path: 'note/note-book',
      component: {
        key: 'note.noteBook',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.note.note_book',
    },
  },
  {
    parentKey: 'note',
    key: 'note.noteManagement',
    index: 20,
    display: {
      '': {
        label: '笔记管理',
      },
      comvisual: {
        label: '笔记管理',
      },
      elementPlus: {
        label: '笔记管理',
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
      path: 'note/note-management',
      component: {
        key: 'note.noteManagement',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.note.note_management',
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
