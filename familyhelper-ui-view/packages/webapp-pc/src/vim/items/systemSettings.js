const systemSettings = [
  {
    key: 'systemSettings',
    index: 140,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '系统设置',
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
        node: 'ui.pc.menu_visible.system_settings',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'systemSettings.account',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '账户管理',
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
        path: 'app/system-settings/account',
        component: () => import('@/views/items/systemSettings/account/Account.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.system_settings.account',
      },
    },
    node: {
      parentKey: 'systemSettings',
    },
  },
  {
    key: 'systemSettings.accountSecurity',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '账户安全',
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
        path: 'app/system-settings/account-security',
        component: () => import('@/views/items/systemSettings/accountSecurity/AccountSecurity.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.system_settings.account_security',
      },
    },
    node: {
      parentKey: 'systemSettings',
    },
  },
  {
    key: 'systemSettings.role',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '角色管理',
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
        path: 'app/system-settings/role',
        component: () => import('@/views/items/systemSettings/role/Role.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.system_settings.role',
      },
    },
    node: {
      parentKey: 'systemSettings',
    },
  },
  {
    key: 'systemSettings.permissionGroup',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '权限分组管理',
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
        path: 'app/system-settings/permission-group',
        component: () => import('@/views/items/systemSettings/permissionGroup/PermissionGroup.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.system_settings.permission_group',
      },
    },
    node: {
      parentKey: 'systemSettings',
    },
  },
  {
    key: 'systemSettings.permissionNode',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '权限节点管理',
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
        path: 'app/system-settings/permission-node',
        component: () => import('@/views/items/systemSettings/permissionNode/PermissionNode.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.system_settings.permission_node',
      },
    },
    node: {
      parentKey: 'systemSettings',
    },
  },
];

export default systemSettings;
