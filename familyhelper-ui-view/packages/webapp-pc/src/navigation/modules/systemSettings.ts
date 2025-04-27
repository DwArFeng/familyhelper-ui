// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NavigationNodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

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
      component: () => import('@/views/nodes/systemSettings/account/Account.vue'),
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
      component: () => import('@/views/nodes/systemSettings/accountSecurity/AccountSecurity.vue'),
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
      component: () => import('@/views/nodes/systemSettings/role/Role.vue'),
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
      component: () => import('@/views/nodes/systemSettings/permissionGroup/PermissionGroup.vue'),
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
      component: () => import('@/views/nodes/systemSettings/permissionNode/PermissionNode.vue'),
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

export default vimNavigationModule
