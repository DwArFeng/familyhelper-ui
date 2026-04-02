// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type ComponentSetting, type VimCompregModule } from '@/compreg/types.ts'

/**
 * VIM Compreg 模块。
 */
const vimCompregModule: VimCompregModule = {
  init,
  provideComponentSettings: provideCompregSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * Compreg 设置数组。
 */
const compregSettings: ComponentSetting[] = [
  {
    key: 'systemSettings.account',
    name: '账户管理',
    description: '账户管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () => import('@/views/nodes/comvisual/systemSettings/account/Account.vue'),
      comvisual: () => import('@/views/nodes/comvisual/systemSettings/account/Account.vue'),
    },
  },
  {
    key: 'systemSettings.accountSecurity',
    name: '账户安全',
    description: '账户安全',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () =>
        import('@/views/nodes/comvisual/systemSettings/accountSecurity/AccountSecurity.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/systemSettings/accountSecurity/AccountSecurity.vue'),
    },
  },
  {
    key: 'systemSettings.role',
    name: '角色管理',
    description: '角色管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () => import('@/views/nodes/comvisual/systemSettings/role/Role.vue'),
      comvisual: () => import('@/views/nodes/comvisual/systemSettings/role/Role.vue'),
    },
  },
  {
    key: 'systemSettings.permissionScope',
    name: '权限作用域管理',
    description: '权限作用域管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () =>
        import('@/views/nodes/comvisual/systemSettings/permissionScope/PermissionScope.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/systemSettings/permissionScope/PermissionScope.vue'),
    },
  },
  {
    key: 'systemSettings.permissionGroup',
    name: '权限分组管理',
    description: '权限分组管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () =>
        import('@/views/nodes/comvisual/systemSettings/permissionGroup/PermissionGroup.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/systemSettings/permissionGroup/PermissionGroup.vue'),
    },
  },
  {
    key: 'systemSettings.permissionNode',
    name: '权限节点管理',
    description: '权限节点管理',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () => import('@/views/nodes/comvisual/systemSettings/permissionNode/PermissionNode.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/systemSettings/permissionNode/PermissionNode.vue'),
    },
  },
  {
    key: 'systemSettings.accountProtectorSupport',
    name: '账户保护器支持',
    description: '账户保护器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () =>
        import('@/views/nodes/comvisual/systemSettings/accountProtectorSupport/AccountProtectorSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/systemSettings/accountProtectorSupport/AccountProtectorSupport.vue'),
    },
  },
  {
    key: 'systemSettings.permissionFilterSupport',
    name: '权限过滤器支持',
    description: '权限过滤器支持',
    exampleRouterComponentParam: {
      '': {},
      comvisual: {},
    },
    component: {
      '': () =>
        import('@/views/nodes/comvisual/systemSettings/permissionFilterSupport/PermissionFilterSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/comvisual/systemSettings/permissionFilterSupport/PermissionFilterSupport.vue'),
    },
  },
]

/**
 * 提供 ComponentSetting。
 */
function provideCompregSettings(): ComponentSetting[] {
  return compregSettings
}

export default vimCompregModule
