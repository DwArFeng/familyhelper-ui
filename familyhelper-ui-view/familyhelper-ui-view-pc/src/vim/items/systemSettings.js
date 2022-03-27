const systemSettings = [
  {
    key: 'systemSettings',
    index: 110,
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
  {
    key: 'systemSettings.settingCategory',
    index: 40,
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
      },
      router: {
        required: true,
        path: 'app/system-settings/setting-category',
        component: () => import('@/views/items/systemSettings/settingCategory/SettingCategory.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.system_settings.setting_category',
      },
    },
    node: {
      parentKey: 'systemSettings',
    },
  },
  {
    key: 'systemSettings.settingNode',
    index: 50,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '配置仓库维护',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/system-settings/setting-node',
        component: () => import('@/views/items/systemSettings/settingNode/SettingNode.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.system_settings.setting_node',
      },
    },
    node: {
      parentKey: 'systemSettings',
    },
  },
];

export default systemSettings;
