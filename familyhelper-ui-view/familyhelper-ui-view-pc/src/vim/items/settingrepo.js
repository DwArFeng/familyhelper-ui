const settingrepo = [
  {
    key: 'settingrepo',
    index: 135,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '配置仓库',
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
        node: 'ui.pc.menu_visible.settingrepo',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'settingrepo.settingCategory',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '配置类型管理',
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
        path: 'app/settingrepo/setting-category',
        component: () => import('@/views/items/settingrepo/settingCategory/SettingCategory.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.settingrepo.setting_category',
      },
    },
    node: {
      parentKey: 'settingrepo',
    },
  },
  {
    key: 'settingrepo.settingNode',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '配置节点管理',
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
        path: 'app/settingrepo/setting-node',
        component: () => import('@/views/items/settingrepo/settingNode/SettingNode.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.settingrepo.setting_node',
      },
    },
    node: {
      parentKey: 'settingrepo',
    },
  },
  {
    key: 'settingrepo.formatterSupport',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '格式化器支持',
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
        path: 'app/settingrepo/formatter-support',
        component: () => import('@/views/items/settingrepo/formatterSupport/FormatterSupport.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.settingrepo.formatter_support',
      },
    },
    node: {
      parentKey: 'settingrepo',
    },
  },
  {
    key: 'settingrepo.settingNodeEditor',
    index: 40,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '配置节点编辑器',
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
        path: 'app/settingrepo/setting-node-editor',
        component: () => import('@/views/items/settingrepo/settingNodeEditor/SettingNodeEditor.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.settingrepo.setting_node_editor',
      },
    },
    node: {
      parentKey: 'settingrepo',
    },
  },
];

export default settingrepo;
