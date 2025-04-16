// noinspection DuplicatedCode

import type { VimComponent, VimComponentModule } from '@/vim/types.ts'

// -----------------------------------------------------------VIM 组件定义-----------------------------------------------------------
/**
 * VIM Navigation。
 */
export interface VimNavigation extends VimComponent {
  setting: Readonly<NavigationSetting>
  nodeRootKeys: () => Readonly<string[]>
  nodeInfos: () => Readonly<NavigationNodeInfo[]>
  nodeInfo: (key: string) => Readonly<NavigationNodeInfo> | null
}

/**
 * Navigation 设置。
 */
export type NavigationSetting = {
  defaultNavigationKey: string
  ezNavEnabled: boolean
  ezNavMaxActiveItem: number
  ezNavRestoreWhenLogin: 'restore-pinned' | 'restore-all'
}

/**
 * Navigation 节点信息。
 */
export type NavigationNodeInfo = {
  parentKey: string | null
  childKeys: string[]
  key: string
  index: number
  display: DisplayInfo
  menu: MenuInfo
  ezNav: EzNavInfo
  router: RouterInfo
  permission: PermissionInfo
}

/**
 * 显示信息。
 */
export type DisplayInfo = Record<string, string>

/**
 * 菜单信息。
 */
export type MenuInfo = {
  shown: boolean
}

/**
 * EzNav 信息。
 */
export type EzNavInfo = {
  shown: boolean
  affix?: boolean
  affixIndex?: number
  closedBehavior?: {
    /**
     * 关闭行为。
     *
     *   back：返回上一级。
     *   default：返回默认页面。
     *   none：不做任何操作。
     */
    type: 'back' | 'default' | 'none'
    data: string | Record<string, string>
  }
}

/**
 * Router 信息。
 */
export type RouterInfo = {
  required: boolean
  path?: string
  // 组件的类型确实是 any，故抑制 eslint 错误。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any
}

/**
 * 权限信息。
 */
export type PermissionInfo = {
  required: boolean
  node?: string
}

// -----------------------------------------------------------模块定义-----------------------------------------------------------
/**
 * VIM Navigation 模块。
 */
export interface VimNavigationModule extends VimComponentModule {
  /**
   * 提供 Navigation 节点设置。
   */
  provideNavigationNodeSettings(): NavigationNodeSetting[]
}

/**
 * Navigation 节点设置。
 */
export type NavigationNodeSetting = {
  parentKey: string | null
  key: string
  index: number
  display?: DisplaySetting
  menu?: MenuSetting
  ezNav?: EzNavSetting
  router?: RouterSetting
  permission?: PermissionSetting
}

/**
 * 显示设置。
 */
export type DisplaySetting = Record<string, string>

/**
 * 菜单设置。
 */
export type MenuSetting = {
  shown: boolean
}

/**
 * EzNav 设置。
 */
export type EzNavSetting = {
  shown: boolean
  affix?: boolean
  affixIndex?: number
  closedBehavior?: {
    /**
     * 关闭行为。
     *
     *   back：返回上一级。
     *   default：返回默认页面。
     *   none：不做任何操作。
     */
    type: 'back' | 'default' | 'none'
    data: string | Record<string, string>
  }
}

/**
 * Router 设置。
 */
export type RouterSetting = {
  required: boolean
  path?: string
  // 组件的类型确实是 any，故抑制 eslint 错误。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any
}

/**
 * 权限设置。
 */
export type PermissionSetting = {
  required: boolean
  node?: string
}
