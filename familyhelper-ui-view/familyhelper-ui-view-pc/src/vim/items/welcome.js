const welcome = [
  {
    key: 'welcome',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '首页',
      },
      menu: {
        shown: false,
      },
      ezNav: {
        shown: true,
        affix: true,
        affixIndex: 0,
      },
      router: {
        required: true,
        path: 'app/welcome',
        component: () => import('@/views/item/welcome/Welcome.vue'),
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

export default welcome;
