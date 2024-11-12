const note = [
  {
    key: 'note',
    index: 110,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '学习笔记',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: false,
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.note',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'note.noteBook',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '笔记本',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/note/note-book',
        component: () => import('@/views/items/note/noteBook/NoteBook.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.note.note_book',
      },
    },
    node: {
      parentKey: 'note',
    },
  },
  {
    key: 'note.noteManagement',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '笔记管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/note/note-management',
        component: () => import('@/views/items/note/noteManagement/NoteManagement.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.note.note_management',
      },
    },
    node: {
      parentKey: 'note',
    },
  },
];

export default note;
