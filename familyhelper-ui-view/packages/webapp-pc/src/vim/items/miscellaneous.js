const miscellaneous = [
  {
    key: 'miscellaneous',
    index: 150,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '杂项',
      },
      menu: {
        shown: false,
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
        required: false,
        node: '',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'miscellaneous.fileEditor',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '文件编辑器',
      },
      menu: {
        shown: false,
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
        path: 'app/miscellaneous/file-editor',
        component: () => import('@/views/items/miscellaneous/fileEditor/FileEditor.vue'),
      },
      permission: {
        required: false,
        node: '',
      },
    },
    node: {
      parentKey: 'miscellaneous',
    },
  },
];

export default miscellaneous;
