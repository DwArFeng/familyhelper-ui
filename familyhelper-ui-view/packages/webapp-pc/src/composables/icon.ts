// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type Component, type VNode } from 'vue'
import { h } from 'vue'

import * as ElementPlusIcons from '@element-plus/icons-vue'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

// region IconFont 图标

/**
 * 使用 IconFont 图标。
 *
 * 该方法可以基于 IconFont 图标的字符，快速创建一个图标组件。
 *
 * @param iconCharacter IconFont 图标的字符。
 * @returns 对应的 IconFont 图标组件，可以用于渲染。
 */
export function useIconfontButtonIcon(iconCharacter: string): VNode
/**
 * 使用 IconFont 图标，并指定字号尺寸。
 *
 * @param iconCharacter IconFont 图标的字符。
 * @param fontSize 图标字号，单位为 px。
 * @returns 对应的 IconFont 图标组件，可以用于渲染。
 */
export function useIconfontButtonIcon(iconCharacter: string, fontSize: number): VNode

export function useIconfontButtonIcon(
  ...args: [iconCharacter: string] | [iconCharacter: string, fontSize: number]
): VNode {
  const [iconCharacter, fontSize] = args
  if (fontSize !== undefined) {
    return h('i', { class: 'iconfont', style: { fontSize: `${fontSize}px` } }, iconCharacter)
  }
  return h('i', { class: 'iconfont' }, iconCharacter)
}

// endregion

// region Element Plus 图标

const elementPlusIconMap: ReadonlyMap<string, Component> = buildElementPlusIconMap()

function buildElementPlusIconMap(): ReadonlyMap<string, Component> {
  const map = new Map<string, Component>()
  for (const exportName of Object.keys(ElementPlusIcons)) {
    const component = ElementPlusIcons[exportName as keyof typeof ElementPlusIcons]
    if (typeof component === 'object' || typeof component === 'function') {
      map.set(toKebabCase(exportName), component as Component)
    }
  }
  return map
}

function resolveElementPlusIconComponent(iconName: string): Component | undefined {
  const directMatch = elementPlusIconMap.get(iconName)
  if (directMatch) {
    return directMatch
  }
  const normalizedName = toKebabCase(iconName)
  return normalizedName === iconName ? undefined : elementPlusIconMap.get(normalizedName)
}

export function useElementPlusIcon(iconName: string): VNode
export function useElementPlusIcon(iconName: string, size: number): VNode

export function useElementPlusIcon(
  ...args: [iconName: string] | [iconName: string, size: number]
): VNode {
  const [iconName, size] = args
  const resolvedComponent = resolveElementPlusIconComponent(iconName)
  if (size !== undefined) {
    if (!resolvedComponent) {
      return useMissingIcon(size)
    }
    return h(resolvedComponent, { style: { width: `${size}px`, height: `${size}px` } })
  }
  return resolvedComponent ? h(resolvedComponent) : useMissingIcon()
}

// endregion

// region 缺失图标

/**
 * 使用缺失图标。
 *
 * 该方法可以创建一个缺失图标的占位符。
 *
 * @returns 缺失图标的占位符组件，可以用于渲染。
 */
export function useMissingIcon(): VNode
export function useMissingIcon(size: number): VNode

export function useMissingIcon(...args: [] | [size: number]): VNode {
  if (args.length === 0) {
    return h('i', { style: { display: 'block', backgroundColor: 'magenta' } })
  }
  const [size] = args
  return h('i', {
    style: {
      display: 'block',
      backgroundColor: 'magenta',
      width: `${size}px`,
      height: `${size}px`,
    },
  })
}

// endregion
