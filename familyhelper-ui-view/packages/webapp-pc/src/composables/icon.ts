// noinspection JSUnusedGlobalSymbols

import type { VNode } from 'vue'
import { h } from 'vue'

// -----------------------------------------------------------IconFont 图标-----------------------------------------------------------
/**
 * 使用 IconFont 图标。
 *
 * 该方法可以基于 IconFont 图标的字符，快速创建一个图标组件。
 *
 * @param iconCharacter IconFont 图标的字符。
 * @returns 对应的 IconFont 图标组件，可以用于渲染。
 */
export function useIconfontButtonIcon(iconCharacter: string): VNode {
  return h('i', { class: 'iconfont' }, iconCharacter)
}

// -----------------------------------------------------------缺失图标-----------------------------------------------------------
/**
 * 使用缺失图标。
 *
 * 该方法可以创建一个缺失图标的占位符。
 *
 * @returns 缺失图标的占位符组件，可以用于渲染。
 */
export function useMissingIcon(): VNode {
  return h('i', { style: { display: 'block', backgroundColor: 'magenta' } })
}
