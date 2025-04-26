// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { NavigationNodeSetting, VimNavigationModule } from '@/navigation/types.ts'

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
      label: '学习笔记',
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
      label: '笔记本',
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
      component: () => import('@/views/nodes/note/noteBook/NoteBook.vue'),
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
      label: '笔记管理',
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
      component: () => import('@/views/nodes/note/noteManagement/NoteManagement.vue'),
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
