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
    component: {
      '': () => import('@/views/nodes/elementPlus/systemSettings/account/Account.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/systemSettings/account/Account.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/systemSettings/account/Account.vue'),
    },
  },
  {
    key: 'systemSettings.accountSecurity',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/systemSettings/accountSecurity/AccountSecurity.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/systemSettings/accountSecurity/AccountSecurity.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/systemSettings/accountSecurity/AccountSecurity.vue'),
    },
  },
  {
    key: 'systemSettings.role',
    component: {
      '': () => import('@/views/nodes/elementPlus/systemSettings/role/Role.vue'),
      comvisual: () => import('@/views/nodes/elementPlus/systemSettings/role/Role.vue'),
      elementPlus: () => import('@/views/nodes/elementPlus/systemSettings/role/Role.vue'),
    },
  },
  {
    key: 'systemSettings.permissionScope',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionScope/PermissionScope.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionScope/PermissionScope.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionScope/PermissionScope.vue'),
    },
  },
  {
    key: 'systemSettings.permissionGroup',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionGroup/PermissionGroup.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionGroup/PermissionGroup.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionGroup/PermissionGroup.vue'),
    },
  },
  {
    key: 'systemSettings.permissionNode',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionNode/PermissionNode.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionNode/PermissionNode.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionNode/PermissionNode.vue'),
    },
  },
  {
    key: 'systemSettings.accountProtectorSupport',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/systemSettings/accountProtectorSupport/AccountProtectorSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/systemSettings/accountProtectorSupport/AccountProtectorSupport.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/systemSettings/accountProtectorSupport/AccountProtectorSupport.vue'),
    },
  },
  {
    key: 'systemSettings.permissionFilterSupport',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionFilterSupport/PermissionFilterSupport.vue'),
      comvisual: () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionFilterSupport/PermissionFilterSupport.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/systemSettings/permissionFilterSupport/PermissionFilterSupport.vue'),
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
