// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimComponent, type VimComponentModule } from '@/vim/types.ts'

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
   * 默认的 Component。
   *
   * 该字段对应的值是一个函数，调用后返回一个 Component 对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  defaultComponent: () => Component

  /**
   * 根据指定的 key 获取组件。
   *
   * 该字段对应的值是一个函数，接受 Compreg 的 key，返回对应的组件对象或 null。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  component: (key: string) => Component | null
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
 * Compreg 组件。
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
 */
export type ComponentSetting = {
  /**
   * key。
   *
   * 该字段对应的值是一个字符串，表示 Compreg 组件的 key。
   */
  key: string

  /**
   * 组件。
   *
   * 该字段对应的值是一个 Component，表示该 key 对应的组件。
   */
  component: Component
}

// endregion
