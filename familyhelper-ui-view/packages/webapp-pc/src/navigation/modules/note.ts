// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NavigationNodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNavigationNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * Navigation 节点数组。
 */
const navigationNodes: NavigationNodeSetting[] = [
  {
    parentKey: null,
    key: 'note',
    index: 110,
    display: {
      '': {
        label: '学习笔记',
      },
      elementPlus: {
        label: '学习笔记',
      },
      simple: {
        label: '学习笔记',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.note',
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
      elementPlus: {
        label: '笔记本',
      },
      simple: {
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
      node: 'ui.pc.menu_visible.note.note_book',
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
      elementPlus: {
        label: '笔记管理',
      },
      simple: {
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
      node: 'ui.pc.menu_visible.note.note_management',
    },
  },
]

/**
 * 提供 NavigationNodeSetting。
 */
function provideNavigationNodeSettings(): NavigationNodeSetting[] {
  return navigationNodes
}

export default vimNavigationModule
