import type { NavigationNodeSetting, VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNavigationNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * Navigation 节点数组。
 */
const navigationNodes: NavigationNodeSetting[] = [
  {
    parentKey: null,
    key: 'systemSettings',
    index: 140,
    display: {
      label: '系统设置',
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.system_settings',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.account',
    index: 10,
    display: {
      label: '账户管理',
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'system-settings/account',
      component: () => import('@/views/items/systemSettings/account/Account.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.system_settings.account',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.accountSecurity',
    index: 20,
    display: {
      label: '账户安全',
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'system-settings/account-security',
      component: () => import('@/views/items/systemSettings/accountSecurity/AccountSecurity.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.system_settings.account_security',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.role',
    index: 30,
    display: {
      label: '角色管理',
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'system-settings/role',
      component: () => import('@/views/items/systemSettings/role/Role.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.system_settings.role',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.permissionGroup',
    index: 40,
    display: {
      label: '权限分组管理',
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'system-settings/permission-group',
      component: () => import('@/views/items/systemSettings/permissionGroup/PermissionGroup.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.system_settings.permission_group',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.permissionNode',
    index: 50,
    display: {
      label: '权限节点管理',
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'system-settings/permission-node',
      component: () => import('@/views/items/systemSettings/permissionNode/PermissionNode.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.system_settings.permission_node',
    },
  },
]

/**
 * 提供 NavigationNodeSetting。
 */
function provideNavigationNodeSettings(): NavigationNodeSetting[] {
  return navigationNodes
}

// 该导出语句通过 import.meta.glob 被动态导入，故忽略相关警告。
// noinspection JSUnusedGlobalSymbols
export default vimNavigationModule
