const miscellaneous = [
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
        path: 'app/asset-management/asset-catalog',
        component: () => import('@/views/items/miscellaneous/fileEditor/FileEditor.vue'),
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
];

export default miscellaneous;
