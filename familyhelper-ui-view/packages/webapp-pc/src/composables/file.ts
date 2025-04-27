// noinspection JSUnusedGlobalSymbols

import { type VNode } from 'vue'

import { type CreateInfo, type DisplayInfo, type IconInfo } from '@/util/file.ts'
import { getCreateInfo, getDisplayInfo } from '@/util/file.ts'

import { useIconfontButtonIcon, useMissingIcon } from './icon.ts'

// -----------------------------------------------------------文件图标-----------------------------------------------------------
/**
 * 使用文件创建图标。
 *
 * 该方法可以基于指定的文件指示器，快速创建一个对应的图标组件。
 *
 * 如果指定的文件指示器没有对应的图标信息，则返回一个缺失的图标组件。
 *
 * @param indicator 文件指示器。
 * @returns 经过处理后返回的图标组件，可以用于渲染。
 */
export function useCreateIcon(indicator: unknown): VNode {
  const createInfo: CreateInfo | null = getCreateInfo(indicator)
  if (!createInfo) {
    return useMissingIcon()
  }
  const createIconInfo: IconInfo = createInfo.icon
  if (createIconInfo.type === 'iconfont') {
    return useIconfontButtonIcon(createIconInfo.content)
  } else {
    return useMissingIcon()
  }
}

/**
 * 使用文件创建图标。
 *
 * 该方法可以基于指定的文件指示器，快速创建一个对应的图标组件。
 *
 * 如果指定的文件指示器没有对应的图标信息，则返回指定的默认图标信息对应的图标组件。
 *
 * 如果指定的默认图标信息无法创建图标组件，则返回一个缺失的图标组件。
 *
 * @param indicator 文件指示器。
 * @param defaultIconInfo 默认图标信息。
 * @returns 经过处理后返回的图标组件，可以用于渲染。
 */
export function useCreateIconWithDefaults(indicator: unknown, defaultIconInfo: IconInfo): VNode {
  const createInfo: CreateInfo | null = getCreateInfo(indicator)
  const createIconInfo: IconInfo = createInfo?.icon ?? defaultIconInfo
  if (createIconInfo.type === 'iconfont') {
    return useIconfontButtonIcon(createIconInfo.content)
  } else {
    return useMissingIcon()
  }
}

/**
 * 使用文件展示图标。
 *
 * 该方法可以基于指定的文件指示器，快速展示一个对应的图标组件。
 *
 * 如果指定的文件指示器没有对应的图标信息，则返回一个缺失的图标组件。
 *
 * @param indicator 文件指示器。
 * @returns 经过处理后返回的图标组件，可以用于渲染。
 */
export function useDisplayIcon(indicator: unknown): VNode {
  const displayInfo: DisplayInfo | null = getDisplayInfo(indicator)
  if (!displayInfo) {
    return useMissingIcon()
  }
  const displayIconInfo: IconInfo = displayInfo.icon
  if (displayIconInfo.type === 'iconfont') {
    return useIconfontButtonIcon(displayIconInfo.content)
  } else {
    return useMissingIcon()
  }
}

/**
 * 使用文件展示图标。
 *
 * 该方法可以基于指定的文件指示器，快速展示一个对应的图标组件。
 *
 * 如果指定的文件指示器没有对应的图标信息，则返回指定的默认图标信息对应的图标组件。
 *
 * 如果指定的默认图标信息无法展示图标组件，则返回一个缺失的图标组件。
 *
 * @param indicator 文件指示器。
 * @param defaultIconInfo 默认图标信息。
 * @returns 经过处理后返回的图标组件，可以用于渲染。
 */
export function useDisplayIconWithDefaults(indicator: unknown, defaultIconInfo: IconInfo): VNode {
  const displayInfo: DisplayInfo | null = getDisplayInfo(indicator)
  const displayIconInfo: IconInfo = displayInfo?.icon ?? defaultIconInfo
  if (displayIconInfo.type === 'iconfont') {
    return useIconfontButtonIcon(displayIconInfo.content)
  } else {
    return useMissingIcon()
  }
}
