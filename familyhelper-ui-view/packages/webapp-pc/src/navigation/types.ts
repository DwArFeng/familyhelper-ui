// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { VimComponent, VimComponentModule } from '@/vim/types.ts'

// -----------------------------------------------------------VIM 组件定义-----------------------------------------------------------
/**
 * VIM Navigation。
 */
export interface VimNavigation extends VimComponent {
  /**
   * Navigation 设置。
   *
   * 该字段对应的值是一个只读对象，包含了 Navigation 的设置项。
   *
   * 该字段对应的值可以在 VIM 任何状态下调用。
   */
  setting: Readonly<NavigationSetting>

  /**
   * Navigation 根节点 key 列表。
   *
   * 该字段对应的值是一个函数，调用后返回一个只读的 string[]，表示所有可访问的 Navigation 根节点的 key。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  nodeRootKeys: () => Readonly<string[]>

  /**
   * Navigation 节点信息。
   *
   * 该字段对应的值是一个函数，调用后返回一个只读的 NavigationNodeInfo[]，表示所有 Navigation 节点的信息。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  nodeInfos: () => Readonly<NavigationNodeInfo[]>

  /**
   * 根据指定的 key 获取 Navigation 节点信息。
   *
   * 该字段对应的值是一个函数，接受 Navigation 节点的 key，返回对应的只读的 Navigation 节点信息或 null。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  nodeInfo: (key: string) => Readonly<NavigationNodeInfo> | null
}

/**
 * Navigation 设置。
 */
export type NavigationSetting = {
  /**
   * 默认 Navigation key。
   *
   * 该字段对应的值是一个字符串，表示默认的 Navigation 的 key。
   *
   * 该字段的值必须是一个 `./modules/*.ts` 文件中提供的
   * `VimNavigationModule.provideNavigationNodeSettings()` 方法返回的 `NavigationNodeSetting[]`
   * 中存在的 `NavigationNodeSetting.key` 字段对应的值。
   */
  defaultNavigationKey: string

  /**
   * 是否启用 EzNav。
   *
   * 该字段对应的值是一个布尔值，表示是否启用 EzNav。
   */
  ezNavEnabled: boolean

  /**
   * EzNav 最大活动项数量。
   *
   * 该字段对应的值是一个数字，表示 EzNav 最大活动项数量。
   */
  ezNavMaxActiveItem: number

  /**
   * EzNav 恢复登录时行为。
   *
   * 该字段对应的值是一个字符串枚举，表示 EzNav 恢复登录时行为，可能的值为：
   * - `restore-pinned`：恢复固定项。
   * - `restore-all`：恢复全部项。
   */
  ezNavRestoreWhenLogin: 'restore-pinned' | 'restore-all'
}

/**
 * Navigation 节点信息。
 */
export type NavigationNodeInfo = {
  /**
   * 父节点 key。
   *
   * 该字段对应的值是一个字符串或 null：
   * - 如果父节点 key 为字符串，则该值为父节点的 key。
   * - 如果父节点 key 为 null，则表示该节点为根节点。
   */
  parentKey: string | null

  /**
   * 子节点 key 列表。
   *
   * 该字段对应的值是一个只读的 string[]，表示所有子节点的 key。
   */
  childKeys: string[]

  /**
   * key。
   *
   * 该字段对应的值是一个字符串，表示 Navigation 节点的 key。
   */
  key: string

  /**
   * 索引。
   *
   * 该字段对应的值是一个数字，表示 Navigation 节点的索引，索引值越小，节点越靠前。
   */
  index: number

  /**
   * 显示信息。
   *
   * 该字段对应的值是一个 DisplayInfo，表示 Navigation 节点的显示信息。
   */
  display: DisplayInfo

  /**
   * 菜单信息。
   *
   * 该字段对应的值是一个 MenuInfo，表示 Navigation 节点的菜单信息。
   */
  menu: MenuInfo

  /**
   * EzNav 信息。
   *
   * 该字段对应的值是一个 EzNavInfo，表示 Navigation 节点的 EzNav 信息。
   */
  ezNav: EzNavInfo

  /**
   * 路由信息。
   *
   * 该字段对应的值是一个 RouterInfo，表示 Navigation 节点的路由信息。
   */
  router: RouterInfo

  /**
   * 权限信息。
   *
   * 该字段对应的值是一个 PermissionInfo，表示 Navigation 节点的权限信息。
   */
  permission: PermissionInfo
}

/**
 * 显示信息。
 *
 * 该类型是一个只读的 Record<string, string>，表示 Navigation 节点的显示信息。
 *
 * 该字段可以存放 `string-string` 对象，其中对象的键的取值由 library 模块的 `Visualizer` 决定。
 * 开发人员需要提供满足 VIM 框架中所有注册的 `Visualizer` 规定的键及其对应的值，
 * 以避免 `Visualizer` 渲染时出现错误。
 */
export type DisplayInfo = Record<string, string>

/**
 * 菜单信息。
 */
export type MenuInfo = {
  /**
   * 显示。
   *
   * 该字段对应的值是一个布尔值，表示是否在菜单中显示该节点。
   *
   * 如果 `shown` 为 `false`，则表示该节点不会在菜单中显示，此时该节点仍可能在 EzNav 中显示。
   * 此时用户仍然可以通过 EzNav 或导航栏 URL 访问该节点。
   */
  shown: boolean
}

/**
 * EzNav 信息。
 */
export type EzNavInfo = {
  /**
   * 显示。
   *
   * 该字段对应的值是一个布尔值，表示是否在 EzNav 中显示该节点。
   *
   * 如果 `shown` 为 `false`，则表示该节点不会在 EzNav 中显示，
   * 当用户通过菜单或 导航栏 URL 访问该节点时，该节点不会出现在 EzNav 中。
   */
  shown: boolean

  /**
   * 固定。
   *
   * 该字段对应的值是一个布尔值，表示 EzNav 中是否固定该节点。
   * 如果 `affix` 为 `true`，则表示 EzNav 中固定该节点，该节点会在 EzNav 中固定显示，且不可被关闭。
   *
   * 如果 `shown` 为 `false`，则该字段无需提供。
   *
   * 在实践中，首页、仪表盘等关键页面推荐设置此字段为 `true`。
   *
   * @see shown
   * @see affixIndex
   */
  affix?: boolean

  /**
   * 固定索引。
   *
   * 该字段对应的值是一个数字，表示 EzNav 中固定项的索引，索引值越小，固定项越靠前。
   *
   * 如果 `shown` 为 `false`，则该字段无需提供。
   *
   * @see shown
   * @see affix
   */
  affixIndex?: number

  /**
   * 关闭行为。
   *
   * 该字段对应的值是一个对象，表示 EzNav 中关闭该节点的行为。
   *
   * 如果 `shown` 为 `false`，则该字段无需提供。
   *
   * @see shown
   */
  closedBehavior?: {
    /**
     * 类型。
     *
     * 该字段对应的值是一个字符串枚举，表示 EzNav 中关闭该节点的行为的类型，可能的值为：
     * - `back`：返回上一级。
     * - `default`：返回默认页面。
     * - `none`：不做任何操作。
     *
     * 某些类型的值可能需要额外的数据来完成操作，这些数据需要在 `data` 字段中提供。
     *
     * 不同的类型需要的数据请参阅 `data` 字段的文档注释。
     *
     * @see data
     */
    type: 'back' | 'default' | 'none'

    /**
     * 数据。
     *
     * 该字段可以存放 `string-string` 对象，其中对象的键的取值由 `type` 字段决定。
     *
     * - 如果 `type` 为 `back`，则该字段的类型为。
     *   ```ts
     *   {}
     *   ```
     *
     * - 如果 `type` 为 `default`，则该字段的类型为。
     *   ```ts
     *   {}
     *   ```
     *
     * - 如果 `type` 为 `'none'`，则该字段的类型为。
     *   ```ts
     *   {}
     *   ```
     *
     * @see type
     */
    data: Record<string, string>
  }
}

/**
 * 路由信息。
 */
export type RouterInfo = {
  /**
   * 需求。
   *
   * 该字段对应的值是一个布尔值，表示是否需要路由。
   *
   * 如果 `required` 为 `false`，则表示该节点不需要路由。
   *
   * 在实践中，如果父项菜单的作用类似于 “菜单目录”，则该项菜单的 `required` 字段推荐设置为 `false`。
   */
  required: boolean

  /**
   * 路由路径。
   *
   * 该字段对应的值是一个字符串，表示路由的路径。
   *
   * 如果 `required` 为 `false`，则该字段无需提供。
   *
   * @see required
   */
  path?: string

  /**
   * 组件。
   *
   * 该字段对应的值是一个组件，表示路由的组件。
   *
   * 如果 `required` 为 `false`，则该字段无需提供。
   *
   * @see required
   */
  // 组件的类型确实是 any，故抑制 eslint 错误。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any
}

/**
 * 权限信息。
 */
export type PermissionInfo = {
  /**
   * 需求。
   *
   * 该字段对应的值是一个布尔值，表示是否需要权限。
   *
   * 如果 `required` 为 `false`，则表示该节点不需要权限。
   *
   * 在实践中，首页、关于我们等公共页面推荐设置此字段为 `false`。
   */
  required: boolean

  /**
   * 节点。
   *
   * 该字段对应的值是一个字符串，表示权限节点。
   *
   * 如果 `required` 为 `false`，则该字段无需提供。
   *
   * @see required
   */
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
  /**
   * 父节点 key。
   *
   * 该字段对应的值是一个字符串或 null：
   * - 如果父节点 key 为字符串，则该值为父节点的 key。
   * - 如果父节点 key 为 null，则表示该节点为根节点。
   */
  parentKey: string | null

  /**
   * key。
   *
   * 该字段对应的值是一个字符串，表示 Navigation 节点的 key。
   */
  key: string

  /**
   * 索引。
   *
   * 该字段对应的值是一个数字，表示 Navigation 节点的索引，索引值越小，节点越靠前。
   */
  index: number

  /**
   * 显示。
   *
   * 该字段对应的值是一个 DisplaySetting，表示 Navigation 节点的显示设置。
   */
  display: DisplaySetting

  /**
   * 菜单。
   *
   * 该字段对应的值是一个 MenuSetting，表示 Navigation 节点的菜单设置。
   *
   * 如果不需要在菜单中显示此 Navigation 节点，则该字段无需提供。
   */
  menu?: MenuSetting

  /**
   * EzNav。
   *
   * 该字段对应的值是一个 EzNavSetting，表示 Navigation 节点的 EzNav 设置。
   *
   * 如果不需要在 EzNav 中显示此 Navigation 节点，则该字段无需提供。
   */
  ezNav?: EzNavSetting

  /**
   * 路由。
   *
   * 该字段对应的值是一个 RouterSetting，表示 Navigation 节点的路由设置。
   *
   * 如果不需要路由，则该字段无需提供。
   */
  router?: RouterSetting

  /**
   * 权限。
   *
   * 该字段对应的值是一个 PermissionSetting，表示 Navigation 节点的权限设置。
   *
   * 如果不需要权限，则该字段无需提供。
   */
  permission?: PermissionSetting
}

/**
 * 显示设置。
 *
 * 该类型是一个只读的 Record<string, string>，表示 Navigation 节点的显示设置。
 *
 * 该字段可以存放 `string-string` 对象，其中对象的键的取值由 library 模块的 `Visualizer` 决定。
 * 开发人员需要提供满足 VIM 框架中所有注册的 `Visualizer` 规定的键及其对应的值，
 * 以避免 `Visualizer` 渲染时出现错误。
 */
export type DisplaySetting = Record<string, string>

/**
 * 菜单设置。
 */
export type MenuSetting = {
  /**
   * 显示。
   *
   * 该字段对应的值是一个布尔值，表示是否在菜单中显示该节点。
   *
   * 如果 `shown` 为 `false`，则表示该节点不会在菜单中显示，此时该节点仍可能在 EzNav 中显示。
   * 此时用户仍然可以通过 EzNav 或导航栏 URL 访问该节点。
   */
  shown: boolean
}

/**
 * EzNav 设置。
 */
export type EzNavSetting = {
  /**
   * 显示。
   *
   * 该字段对应的值是一个布尔值，表示是否在 EzNav 中显示该节点。
   *
   * 如果 `shown` 为 `false`，则表示该节点不会在 EzNav 中显示，
   * 当用户通过菜单或导航栏 URL 访问该节点时，该节点不会出现在 EzNav 中。
   */
  shown: boolean

  /**
   * 固定。
   *
   * 该字段对应的值是一个布尔值，表示 EzNav 中是否固定该节点。
   * 如果 `affix` 为 `true`，则表示 EzNav 中固定该节点，该节点会在 EzNav 中固定显示，且不可被关闭。
   *
   * 如果 `shown` 为 `false`，则该字段无需提供。
   *
   * 在实践中，首页、仪表盘等关键页面推荐设置此字段为 `true`。
   *
   * @see shown
   * @see affixIndex
   */
  affix?: boolean

  /**
   * 固定索引。
   *
   * 该字段对应的值是一个数字，表示 EzNav 中固定项的索引，索引值越小，固定项越靠前。
   *
   * 如果 `shown` 为 `false`，则该字段无需提供。
   *
   * @see shown
   * @see affix
   */
  affixIndex?: number

  /**
   * 关闭行为。
   *
   * 该字段对应的值是一个对象，表示 EzNav 中关闭该节点的行为。
   *
   * 如果 `shown` 为 `false`，则该字段无需提供。
   *
   * @see shown
   */
  closedBehavior?: {
    /**
     * 类型。
     *
     * 该字段对应的值是一个字符串枚举，表示 EzNav 中关闭该节点的行为的类型，可能的值为：
     * - `back`：返回上一级。
     * - `default`：返回默认页面。
     * - `none`：不做任何操作。
     *
     * 某些类型的值可能需要额外的数据来完成操作，这些数据需要在 `data` 字段中提供。
     *
     * 不同的类型需要的数据请参阅 `data` 字段的文档注释。
     *
     * @see data
     */
    type: 'back' | 'default' | 'none'

    /**
     * 数据。
     *
     * 该字段可以存放 `string-string` 对象，其中对象的键的取值由 `type` 字段决定。
     *
     * - 如果 `type` 为 `back`，则该字段的类型为。
     *   ```ts
     *   {}
     *   ```
     *
     * - 如果 `type` 为 `default`，则该字段的类型为。
     *   ```ts
     *   {}
     *   ```
     *
     * - 如果 `type` 为 `'none'`，则该字段的类型为。
     *   ```ts
     *   {}
     *   ```
     *
     * @see type
     */
    data: Record<string, string>
  }
}

/**
 * 路由设置。
 */
export type RouterSetting = {
  /**
   * 需求。
   *
   * 该字段对应的值是一个布尔值，表示是否需要路由。
   *
   * 如果 `required` 为 `false`，则表示该节点不需要路由。
   *
   * 在实践中，如果父项菜单的作用类似于 “菜单目录”，则该项菜单的 `required` 字段推荐设置为 `false`。
   */
  required: boolean

  /**
   * 路由路径。
   *
   * 该字段对应的值是一个字符串，表示路由的路径。
   *
   * 如果 `required` 为 `false`，则该字段无需提供。
   *
   * @see required
   */
  path?: string

  /**
   * 组件。
   *
   * 该字段对应的值是一个组件，表示路由的组件。
   *
   * 如果 `required` 为 `false`，则该字段无需提供。
   *
   * @see required
   */
  // 组件的类型确实是 any，故抑制 eslint 错误。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any
}

/**
 * 权限设置。
 */
export type PermissionSetting = {
  /**
   * 需求。
   *
   * 该字段对应的值是一个布尔值，表示是否需要权限。
   *
   * 如果 `required` 为 `false`，则表示该节点不需要权限。
   *
   * 在实践中，首页、关于我们等公共页面推荐设置此字段为 `false`。
   */
  required: boolean

  /**
   * 节点。
   *
   * 该字段对应的值是一个字符串，表示权限节点。
   *
   * 如果 `required` 为 `false`，则该字段无需提供。
   *
   * @see required
   */
  node?: string
}
