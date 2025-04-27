// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimComponent, type VimComponentModule } from '@/vim/types.ts'
import { type VNode } from 'vue'

// -----------------------------------------------------------VIM 组件定义-----------------------------------------------------------
/**
 * VIM Library。
 */
export interface VimLibrary extends VimComponent {
  /**
   * Library 设置。
   *
   * 该字段对应的值是一个只读对象，包含了 Library 的设置项。
   *
   * 该字段对应的值可以在 VIM 任何状态下调用。
   */
  setting: Readonly<LibrarySetting>

  /**
   * 默认的 Visualizer。
   *
   * 该字段对应的值是一个函数，调用后返回一个 Visualizer 对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  defaultVisualizer: () => Visualizer

  /**
   * Visualizer key 列表。
   *
   * 该字段对应的值是一个函数，调用后返回一个只读的 string[]，表示所有可用的 Visualizer 的 key。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  visualizerKeys: () => Readonly<string[]>

  /**
   * Visualizer 列表。
   *
   * 该字段对应的值是一个函数，调用后返回一个只读的 Visualizer[]，表示所有可用的 Visualizer。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  visualizers: () => Readonly<Visualizer[]>

  /**
   * 根据指定的 key 获取 Visualizer。
   *
   * 该字段对应的值是一个函数，接受 VimLibraryModule 的 key，返回对应的 Visualizer 对象或 null。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  visualizer: (key: string) => Visualizer | null
}

/**
 * Library 设置。
 */
export type LibrarySetting = {
  /**
   * 默认 Visualizer key。
   *
   * 该字段对应的值是一个字符串，表示默认的可视化器的 key。
   *
   * 该字段的值必须是一个 `./modules` 目录下的合法模块名称。
   * 模块名称与 `./modules` 目录的文件名的 `kebab-case` 形式相同。
   *
   * 该值对应的模块必须是一个合法的 `VimLibraryModule`，
   * 且 `provideVisualizer()` 方法必须返回一个非 `null` 的值。
   *
   * 例如：
   * ```
   * . - modules 目录
   * ├─── foo - 模块目录（可以返回一个非 null 的可视化器）
   * ├─── bar - 模块目录 （不能返回一个非 null 的可视化器）
   * └─── fooBarBaz - 模块目录 （可以返回一个非 null 的可视化器）
   * ```
   *
   * 在上面的例子中，`defaultVisualizerKey` 的值可以是 `foo` 或 `foo-bar-baz`。
   */
  defaultVisualizerKey: string
}

// -----------------------------------------------------------模块定义-----------------------------------------------------------
/**
 * VIM Library 模块。
 */
export interface VimLibraryModule extends VimComponentModule {
  /**
   * 提供 Visualizer。
   *
   * 当模块可以提供可视化方案时，返回一个非 null 的 Visualizer 对象；
   * 当模块不可以提供可视化方案时，返回 null。
   *
   * @returns Visualizer 对象或 null。
   */
  provideVisualizer(): Visualizer | null
}

/**
 * Visualizer。
 */
export interface Visualizer {
  /**
   * 通知。
   *
   * 该方法被调用时，可视化方案需要根据传入的参数在页面上进行通知处理，如弹窗、提示等。
   *
   * 该方法为 `notify` 的重载方法之一，当 API 响应代码为 bad（非 `0`） 时，该方法将会被调用。
   *
   * 该方法的参数 `type` 是固定值，为 `apiResponseBad`，代表 API 请求返回错误代码。
   * 该方法的参数 `responseMeta` 是一个对象，包含了 API 请求返回的错误信息。
   *
   * @param type 通知类型，固定值为 `apiResponseBad`。
   * @param responseMeta 响应元数据，包含了 API 请求返回的错误信息。
   */
  notify(type: Extract<NotifyType, 'apiResponseBad'>, responseMeta: ResponseMeta): void

  /**
   * 通知。
   *
   * 该方法被调用时，可视化方案需要根据传入的参数在页面上进行通知处理，如弹窗、提示等。
   *
   * 该方法为 `notify` 的重载方法之一，当 API 请求返回错误时，该方法将会被调用。
   *
   * 该方法的参数 `type` 是固定值，为 `apiResponseError`，代表 API 请求返回错误。
   * 该方法的参数 `err` 是一个 Error 对象，包含了 API 请求返回的错误信息。
   *
   * @param type 通知类型，固定值为 `apiResponseError`。
   * @param err 错误对象，包含了 API 请求返回的错误信息。
   */
  notify(type: Extract<NotifyType, 'apiResponseError'>, err: Error): void

  /**
   * 通知。
   *
   * 该方法被调用时，可视化方案需要根据传入的参数在页面上进行通知处理，如弹窗、提示等。
   *
   * 该方法为 `notify` 的重载方法之一，页面或者组件需要显示错误信息时，该方法将会被调用。
   *
   * 该方法的参数 `type` 是固定值，为 `errorMessage`，代表页面或者组件需要显示错误信息。
   * 该方法的参数 `message` 是一个字符串，包含了需要显示的错误信息。
   *
   * @param type 通知类型，固定值为 `errorMessage`。
   * @param message 错误信息，包含了需要显示的错误信息。
   */
  notify(type: Extract<NotifyType, 'errorMessage'>, message: string): void

  /**
   * 渲染。
   *
   * 该方法被调用时，可视化方案需要根据传入的参数在页面上进行渲染处理，如渲染登录页面、布局页面等。
   *
   * 该方法为 `render` 的重载方法之一，当需要渲染登录页面时，该方法将会被调用。
   *
   * 该方法的参数 `type` 是固定值，为 `login`，代表需要渲染登录页面。
   * 该方法的参数 `h` 是一个 Vue 的 hyperscript 函数，用于渲染 Vue 组件。
   *
   * @param type 渲染类型，固定值为 `login`。
   * @param h hyperscript 函数，用于渲染 Vue 组件。
   * @returns VNode 对象，表示渲染的结果。
   */
  render(type: Extract<RenderType, 'login'>, h: Hyperscript): VNode

  /**
   * 渲染。
   *
   * 该方法被调用时，可视化方案需要根据传入的参数在页面上进行渲染处理，如渲染登录页面、布局页面等。
   *
   * 该方法为 `render` 的重载方法之一，当需要渲染布局页面时，该方法将会被调用。
   *
   * 该方法的参数 `type` 是固定值，为 `layout`，代表需要渲染布局页面。
   * 该方法的参数 `h` 是一个 Vue 的 hyperscript 函数，用于渲染 Vue 组件。
   *
   * @param type 渲染类型，固定值为 `layout`。
   * @param h hyperscript 函数，用于渲染 Vue 组件。
   * @returns VNode 对象，表示渲染的结果。
   */
  render(type: Extract<RenderType, 'layout'>, h: Hyperscript): VNode

  /**
   * 渲染。
   *
   * 该方法被调用时，可视化方案需要根据传入的参数在页面上进行渲染处理，如渲染登录页面、布局页面等。
   *
   * 该方法为 `render` 的重载方法之一，当需要渲染页面禁止访问时，该方法将会被调用。
   *
   * 该方法的参数 `type` 是固定值，为 `pageForbidden`，代表需要渲染页面禁止访问。
   * 该方法的参数 `h` 是一个 Vue 的 hyperscript 函数，用于渲染 Vue 组件。
   *
   * @param type 渲染类型，固定值为 `pageForbidden`。
   * @param h hyperscript 函数，用于渲染 Vue 组件。
   * @returns VNode 对象，表示渲染的结果。
   */
  render(type: Extract<RenderType, 'pageForbidden'>, h: Hyperscript): VNode

  /**
   * 渲染。
   *
   * 该方法被调用时，可视化方案需要根据传入的参数在页面上进行渲染处理，如渲染登录页面、布局页面等。
   *
   * 该方法为 `render` 的重载方法之一，当需要渲染页面未找到时，该方法将会被调用。
   *
   * 该方法的参数 `type` 是固定值，为 `pageNotFound`，代表需要渲染页面未找到。
   * 该方法的参数 `h` 是一个 Vue 的 hyperscript 函数，用于渲染 Vue 组件。
   *
   * @param type 渲染类型，固定值为 `pageNotFound`。
   * @param h hyperscript 函数，用于渲染 Vue 组件。
   * @returns VNode 对象，表示渲染的结果。
   */
  render(type: Extract<RenderType, 'pageNotFound'>, h: Hyperscript): VNode

  /**
   * 渲染。
   *
   * 该方法被调用时，可视化方案需要根据传入的参数在页面上进行渲染处理，如渲染登录页面、布局页面等。
   *
   * 该方法为 `render` 的重载方法之一，当需要渲染页面错误时，该方法将会被调用。
   *
   * 该方法的参数 `type` 是固定值，为 `pageError`，代表需要渲染页面错误。
   * 该方法的参数 `h` 是一个 Vue 的 hyperscript 函数，用于渲染 Vue 组件。
   *
   * @param type 渲染类型，固定值为 `pageError`。
   * @param h hyperscript 函数，用于渲染 Vue 组件。
   * @returns VNode 对象，表示渲染的结果。
   */
  render(type: Extract<RenderType, 'pageError'>, h: Hyperscript): VNode
}

/**
 * 通知类型。
 *
 * 该类型表示可视化方案在页面上进行通知处理时的类型，为字符串枚举，可能的值为：
 * - `apiResponseBad`：API 响应代码为 bad（非 `0`）。
 * - `apiResponseError`：API 响应返回错误。
 * - `errorMessage`：页面或者组件需要显示错误信息。
 */
export type NotifyType = 'apiResponseBad' | 'apiResponseError' | 'errorMessage'

/**
 * 响应元数据。
 *
 * 该类型表示 API 请求返回的错误信息，包含了错误代码和错误信息。
 */
export type ResponseMeta = {
  /**
   * 错误代码。
   */
  code: number

  /**
   * 错误信息。
   */
  message: string
}

/**
 * 渲染类型。
 *
 * 该类型表示可视化方案在页面上进行渲染处理时的类型，为字符串枚举，可能的值为：
 * - `login`：登录页面。
 * - `layout`：布局页面。
 * - `pageForbidden`：页面禁止访问。
 * - `pageNotFound`：页面未找到。
 * - `pageError`：页面错误。
 */
export type RenderType = 'login' | 'layout' | 'pageForbidden' | 'pageNotFound' | 'pageError'

/**
 * Vue hyperscript 函数。
 */
export type Hyperscript = (typeof import('vue'))['h']
