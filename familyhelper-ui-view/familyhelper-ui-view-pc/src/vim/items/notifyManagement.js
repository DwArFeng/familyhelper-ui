const notifyManagement = [
  {
    key: 'notifyManagement',
    index: 110,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '通知管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: false,
      },
      permission: {
        required: false,
        node: 'ui.pc.menu_visible.notify_settings',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'notifyManagement.notifySetting',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '通知设置',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/notify-settings/notify-setting',
        component: () => import('@/views/items/notifyManagement/notifySetting/NotifySetting.vue'),
      },
      permission: {
        required: false,
        node: 'ui.pc.menu_visible.notify_settings.setting_node',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.topic',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '主题设置',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/notify-settings/topic',
        component: () => import('@/views/items/notifyManagement/topic/Topic.vue'),
      },
      permission: {
        required: false,
        node: 'ui.pc.menu_visible.notify_settings.setting_node',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.routerInfo',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '路由器设置',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/notify-settings/router-info',
        component: () => import('@/views/items/notifyManagement/routerInfo/RouterInfo.vue'),
      },
      permission: {
        required: false,
        node: 'ui.pc.menu_visible.notify_settings.setting_node',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.senderInfo',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '发送器设置',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/notify-settings/sender-info',
        component: () => import('@/views/items/notifyManagement/senderInfo/SenderInfo.vue'),
      },
      permission: {
        required: false,
        node: 'ui.pc.menu_visible.notify_settings.setting_node',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.senderRelation',
    index: 40,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '关联设置',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/notify-settings/sender-relation',
        component: () => import('@/views/items/notifyManagement/senderRelation/SenderRelation.vue'),
      },
      permission: {
        required: false,
        node: 'ui.pc.menu_visible.notify_settings.setting_node',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.routerSupport',
    index: 50,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '路由器支持',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/notify-settings/router-support',
        component: () => import('@/views/items/notifyManagement/routerSupport/RouterSupport.vue'),
      },
      permission: {
        required: false,
        node: 'ui.pc.menu_visible.notify_settings.setting_node',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.senderSupport',
    index: 60,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '发送器支持',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/notify-settings/sender-support',
        component: () => import('@/views/items/notifyManagement/senderSupport/SenderSupport.vue'),
      },
      permission: {
        required: false,
        node: 'ui.pc.menu_visible.notify_settings.setting_node',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
];

export default notifyManagement;
