const notifyManagement = [
  {
    key: 'notifyManagement',
    index: 130,
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
        node: 'ui.pc.menu_visible.notify_management',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'notifyManagement.notification',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '通知接收',
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
        path: 'app/notify-management/notification',
        component: () => import('@/views/items/notifyManagement/notification/Notification.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.notification',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.notifySetting',
    index: 10,
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
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/notify-settings/notify-setting',
        component: () => import('@/views/items/notifyManagement/notifySetting/NotifySetting.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.notify_setting',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.topic',
    index: 20,
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
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/notify-settings/topic',
        component: () => import('@/views/items/notifyManagement/topic/Topic.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.topic',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.metaIndicator',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '元数据指示器',
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
        path: 'app/notify-settings/meta-indicator',
        component: () => import('@/views/items/notifyManagement/metaIndicator/MetaIndicator.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.meta_indicator',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.meta',
    index: 40,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '元数据管理',
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
        path: 'app/notify-settings/meta',
        component: () => import('@/views/items/notifyManagement/meta/Meta.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.meta',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.senderInfo',
    index: 50,
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
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/notify-settings/sender-info',
        component: () => import('@/views/items/notifyManagement/senderInfo/SenderInfo.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.sender_info',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.notifyHistory',
    index: 60,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '通知历史',
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
        path: 'app/notify-settings/notify-history',
        component: () => import('@/views/items/notifyManagement/notifyHistory/NotifyHistory.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.notify_history',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.routerSupport',
    index: 70,
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
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/notify-settings/router-support',
        component: () => import('@/views/items/notifyManagement/routerSupport/RouterSupport.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.router_support',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.dispatcherSupport',
    index: 80,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '调度器支持',
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
        path: 'app/notify-settings/dispatcher-support',
        component: () => import('@/views/items/notifyManagement/dispatcherSupport/DispatcherSupport.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.dispatcher_support',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.senderSupport',
    index: 90,
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
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/notify-settings/sender-support',
        component: () => import('@/views/items/notifyManagement/senderSupport/SenderSupport.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.sender_support',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
];

// noinspection JSUnusedGlobalSymbols
export default notifyManagement;
