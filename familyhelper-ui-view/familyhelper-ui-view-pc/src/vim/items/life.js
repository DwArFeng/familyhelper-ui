const life = [
  {
    key: 'life',
    index: 120,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '日常生活',
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
        node: 'ui.pc.menu_visible.life',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'life.pbSet',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '个人最佳集合',
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
        path: 'app/life/pb-set',
        component: () => import('@/views/items/life/pbSet/PbSet.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.life.pb_set',
      },
    },
    node: {
      parentKey: 'life',
    },
  },
  {
    key: 'life.pbManagement',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '个人最佳管理',
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
        path: 'app/life/pb-management',
        component: () => import('@/views/items/life/pbManagement/PbManagement.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.life.pb_management',
      },
    },
    node: {
      parentKey: 'life',
    },
  },
  {
    key: 'life.activityDataSet',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '活动数据集合',
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
        path: 'app/life/activity-data-set',
        component: () => import('@/views/items/life/activityDataSet/ActivityDataSet.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.life.activity_data_set',
      },
    },
    node: {
      parentKey: 'life',
    },
  },
  {
    key: 'life.activityDataManagement',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '活动数据管理',
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
        path: 'app/life/activity-data-management',
        component: () => import('@/views/items/life/activityDataManagement/ActivityDataManagement.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.life.activity_data_management',
      },
    },
    node: {
      parentKey: 'life',
    },
  },
  {
    key: 'life.activityTypeIndicator',
    index: 40,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '活动类型管理',
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
        path: 'app/life/activity-type-indicator',
        component: () => import('@/views/items/life/activityTypeIndicator/ActivityTypeIndicator.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.life.activity_type_indicator',
      },
    },
    node: {
      parentKey: 'life',
    },
  },
  {
    key: 'life.activityTemplateManagement',
    index: 50,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '活动模板管理',
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
        path: 'app/life/activity-template-management',
        component: () => import('@/views/items/life/activityTemplateManagement/ActivityTemplateManagement.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.life.activity_template_management',
      },
    },
    node: {
      parentKey: 'life',
    },
  },
  {
    key: 'life.activityManagement',
    index: 60,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '活动管理',
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
        path: 'app/life/activity-management',
        component: () => import('@/views/items/life/activityManagement/ActivityManagement.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.life.activity_management',
      },
    },
    node: {
      parentKey: 'life',
    },
  },
  {
    key: 'life.activityTemplateDriverSupport',
    index: 70,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '活动模板驱动支持',
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
        path: 'app/life/activity-template-driver-support',
        component: () => import('@/views/items/life/activityTemplateDriverSupport/ActivityTemplateDriverSupport.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.life.activity_template_driver_support',
      },
    },
    node: {
      parentKey: 'life',
    },
  },
];

export default life;
