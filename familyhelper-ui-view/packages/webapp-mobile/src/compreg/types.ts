// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimComponent, type VimComponentModule } from '@/vim/types.ts'

import { type JsonObject } from '@dwarfeng/familyhelper-ui-component-util/src/util/json.ts'

// region VIM 组件定义

/**
 * VIM Compreg。
 */
export interface VimCompreg extends VimComponent {
  /**
   * Compreg 设置。
   *
   * 该字段对应的值是一个只读对象，包含了 Compreg 的设置项。
   *
   * 该字段对应的值可以在 VIM 任何状态下调用。
   */
  setting: Readonly<CompregSetting>

  /**
   * 默认的 ComponentInfo。
   *
   * 该字段对应的值是一个函数，调用后返回一个 ComponentInfo 对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  defaultComponentInfo: () => ComponentInfo

  /**
   * 根据指定的 key 获取组件信息。
   *
   * 该字段对应的值是一个函数，接受 Compreg 的 key，返回对应的 ComponentInfo 或 null。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  componentInfo: (key: string) => ComponentInfo | null

  /**
   * 全部 Compreg 组件信息。
   *
   * 该字段对应的值是一个函数，调用后返回一个只读的 Record<string, ComponentInfo>，
   * 表示所有已注册的 Compreg 组件信息与其 key 的映射关系。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  componentInfos: () => Readonly<Record<string, ComponentInfo>>
}

/**
 * Compreg 配置。
 */
export type CompregSetting = {
  /**
   * 默认 Component key。
   *
   * 该字段对应的值是一个字符串，表示默认的 Component 的 key。
   *
   * 该字段的值必须是一个 `./modules/*.ts` 文件中提供的
   * `VimCompregModule.provideComponentSettings()` 方法返回的 `ComponentSetting[]`
   * 中存在的 `ComponentSetting.key` 字段对应的值。
   */
  defaultComponentKey: string
}

/**
 * Compreg 组件信息（聚合后）。
 *
 * 该类型由 `ComponentSetting` 经 compreg 聚合转换得到；其中 `exampleRouterComponentParam` 的顶层键会被规范为 kebab-case。
 */
export type ComponentInfo = {
  /**
   * key。
   *
   * 该字段对应的值是一个字符串，表示 Compreg 组件的 key。
   */
  key: string

  /**
   * 名称。
   */
  name: string

  /**
   * 描述。
   */
  description: string

  /**
   * 示例路由组件参数（按可视化器分实例）。
   *
   * 该字段的结构为 `Record<'' | string, JsonObject>`，其中：
   * - 键（如 `''`、`foo`、`bar`）表示不同的 Visualizer 名称。
   * - 值对象为对应 Visualizer 下路由组件参数示例，类型为 {@link JsonObject}。
   *
   * 该字段必须提供一个 `''` 键作为默认值，以便在找不到当前 Visualizer 对应的示例参数时使用。
   */
  exampleRouterComponentParam: Record<'' | string, JsonObject>

  /**
   * 组件。
   *
   * 该类型是一个嵌套的 Record 结构，用于存储不同 Visualizer 的组件。
   *
   * 该字段的结构为 `Record<string, any>`，其中：
   * - 键（如 `''`、`foo`、`bar`）表示不同的 Visualizer 名称。
   * - 值表示组件值，应符合 vue3 的标准组件定义，为静态导入或动态导入的组件对象。
   *
   * 该字段必须提供一个 `''` 键作为默认值，以便在找不到当前 Visualizer 对应的组件时使用。
   */
  // 组件的类型确实是 any，故抑制 eslint 错误。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: Record<string, any> & { '': any }
}

/**
 * Compreg 组件。
 *
 * @see ComponentInfo.component
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Component = Record<string, any> & { '': any }

// endregion

// region 模块定义

/**
 * VIM Compreg 模块。
 */
export interface VimCompregModule extends VimComponentModule {
  /**
   * 提供 Compreg 设置。
   */
  provideComponentSettings(): ComponentSetting[]
}

/**
 * Compreg 设置。
 *
 * 模块通过 `provideComponentSettings()` 提供；字段语义与 {@link ComponentInfo} 对应，`exampleRouterComponentParam` 的键可使用 camelCase，由 compreg 在聚合时转换。
 */
export type ComponentSetting = ComponentInfo

// endregion
