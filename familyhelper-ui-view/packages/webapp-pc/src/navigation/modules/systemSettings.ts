// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * 节点设置数组。
 */
const nodeSettings: NodeSetting[] = [
  {
    parentKey: null,
    key: 'systemSettings',
    index: 140,
    display: {
      '': {
        label: '系统设置',
      },
      comvisual: {
        label: '系统设置',
      },
      elementPlus: {
        label: '系统设置',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.system_settings',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.account',
    index: 10,
    display: {
      '': {
        label: '账户管理',
      },
      comvisual: {
        label: '账户管理',
      },
      elementPlus: {
        label: '账户管理',
      },
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
      component: {
        key: 'systemSettings.account',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.system_settings.account',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.accountSecurity',
    index: 20,
    display: {
      '': {
        label: '账户安全',
      },
      comvisual: {
        label: '账户安全',
      },
      elementPlus: {
        label: '账户安全',
      },
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
      component: {
        key: 'systemSettings.accountSecurity',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.system_settings.account_security',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.role',
    index: 30,
    display: {
      '': {
        label: '角色管理',
      },
      comvisual: {
        label: '角色管理',
      },
      elementPlus: {
        label: '角色管理',
      },
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
      component: {
        key: 'systemSettings.role',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.system_settings.role',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.permissionGroup',
    index: 40,
    display: {
      '': {
        label: '权限分组管理',
      },
      comvisual: {
        label: '权限分组管理',
      },
      elementPlus: {
        label: '权限分组管理',
      },
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
      component: {
        key: 'systemSettings.permissionGroup',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.system_settings.permission_group',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.permissionNode',
    index: 50,
    display: {
      '': {
        label: '权限节点管理',
      },
      comvisual: {
        label: '权限节点管理',
      },
      elementPlus: {
        label: '权限节点管理',
      },
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
      component: {
        key: 'systemSettings.permissionNode',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.system_settings.permission_node',
    },
  },
]

/**
 * 提供 NodeSetting。
 */
function provideNodeSettings(): NodeSetting[] {
  return nodeSettings
}

export default vimNavigationModule
