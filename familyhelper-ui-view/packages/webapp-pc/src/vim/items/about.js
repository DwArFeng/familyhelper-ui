const about = [
  {
    key: 'about',
    index: 9000,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '关于',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: false,
      },
      router: {
        required: true,
        path: 'app/about',
        component: () => import('@/views/items/about/About.vue'),
      },
      permission: {
        required: false,
      },
    },
    node: {
      parentKey: null,
    },
  },
];

// noinspection JSUnusedGlobalSymbols
export default about;
