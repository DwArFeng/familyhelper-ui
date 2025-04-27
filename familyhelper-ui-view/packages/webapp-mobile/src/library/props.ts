// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type LibrarySetting } from '@/library/types.ts'

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
const defaultVisualizerKey: LibrarySetting['defaultVisualizerKey'] = 'element-plus'

export { defaultVisualizerKey }
