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
    key: 'notifyManagement.routerInfo',
    index: 30,
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
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/notify-settings/router-info',
        component: () => import('@/views/items/notifyManagement/routerInfo/RouterInfo.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.router_info',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.senderInfo',
    index: 40,
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
    key: 'notifyManagement.senderRelation',
    index: 50,
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
        closedBehavior: {
          type: 'back',
          data: null,
        },
      },
      router: {
        required: true,
        path: 'app/notify-settings/sender-relation',
        component: () => import('@/views/items/notifyManagement/senderRelation/SenderRelation.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.notify_management.sender_relation',
      },
    },
    node: {
      parentKey: 'notifyManagement',
    },
  },
  {
    key: 'notifyManagement.routerSupport',
    index: 60,
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
    key: 'notifyManagement.senderSupport',
    index: 70,
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

export default notifyManagement;
