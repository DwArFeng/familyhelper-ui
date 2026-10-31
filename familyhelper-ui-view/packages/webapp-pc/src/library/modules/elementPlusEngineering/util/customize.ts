// noinspection JSUnusedGlobalSymbols

import vim from '@/vim'

import {
  downloadFileForPublic as imageNodeDownloadFileForPublic,
  inspectForPublic as imageNodeInspectForPublic,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageNode.ts'
import {
  downloadFileForPublic as imageListNodeDownloadFileForPublic,
  inspectForPublic as imageListNodeInspectForPublic,
  sizeForPublic as imageListNodeSizeForPublic,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageListNode.ts'

import { resolveResponse } from '@/util/response.ts'

import loginBackgroundEmbedded from '@/assets/img/login-background.jpg'
import errorBackgroundEmbedded from '@/assets/img/error-background.jpg'

// region 定制键：登录页背景

/**
 * 登录页背景类型配置键。
 */
export const CUSTOMIZE_KEY_LOGIN_BACKGROUND_TYPE = 'login_background_type'

/**
 * 登录页背景图片节点 category 配置键。
 */
export const CUSTOMIZE_KEY_LOGIN_BACKGROUND_CATEGORY = 'login_background_category'

/**
 * 登录页背景图片节点 args 配置键。
 */
export const CUSTOMIZE_KEY_LOGIN_BACKGROUND_ARGS = 'login_background_args'

/**
 * 登录页背景未配置或回退时使用的内嵌图片 URL。
 */
export const CUSTOMIZE_EMBEDDED_LOGIN_BACKGROUND_URL: string = loginBackgroundEmbedded

// endregion

// region 定制键：403 报错页背景

/**
 * 403 报错页背景类型配置键。
 */
export const CUSTOMIZE_KEY_PAGE_FORBIDDEN_BACKGROUND_TYPE = 'page_forbidden_background_type'

/**
 * 403 报错页背景图片节点 category 配置键。
 */
export const CUSTOMIZE_KEY_PAGE_FORBIDDEN_BACKGROUND_CATEGORY = 'page_forbidden_background_category'

/**
 * 403 报错页背景图片节点 args 配置键。
 */
export const CUSTOMIZE_KEY_PAGE_FORBIDDEN_BACKGROUND_ARGS = 'page_forbidden_background_args'

/**
 * 403 报错页背景未配置或回退时使用的内嵌图片 URL。
 */
export const CUSTOMIZE_EMBEDDED_PAGE_FORBIDDEN_BACKGROUND_URL: string = errorBackgroundEmbedded

// endregion

// region 定制键：404 报错页背景

/**
 * 404 报错页背景类型配置键。
 */
export const CUSTOMIZE_KEY_PAGE_NOT_FOUND_BACKGROUND_TYPE = 'page_not_found_background_type'

/**
 * 404 报错页背景图片节点 category 配置键。
 */
export const CUSTOMIZE_KEY_PAGE_NOT_FOUND_BACKGROUND_CATEGORY = 'page_not_found_background_category'

/**
 * 404 报错页背景图片节点 args 配置键。
 */
export const CUSTOMIZE_KEY_PAGE_NOT_FOUND_BACKGROUND_ARGS = 'page_not_found_background_args'

/**
 * 404 报错页背景未配置或回退时使用的内嵌图片 URL。
 */
export const CUSTOMIZE_EMBEDDED_PAGE_NOT_FOUND_BACKGROUND_URL: string = errorBackgroundEmbedded

// endregion

// region 定制键：500 报错页背景

/**
 * 500 报错页背景类型配置键。
 */
export const CUSTOMIZE_KEY_PAGE_ERROR_BACKGROUND_TYPE = 'page_error_background_type'

/**
 * 500 报错页背景图片节点 category 配置键。
 */
export const CUSTOMIZE_KEY_PAGE_ERROR_BACKGROUND_CATEGORY = 'page_error_background_category'

/**
 * 500 报错页背景图片节点 args 配置键。
 */
export const CUSTOMIZE_KEY_PAGE_ERROR_BACKGROUND_ARGS = 'page_error_background_args'

/**
 * 500 报错页背景未配置或回退时使用的内嵌图片 URL。
 */
export const CUSTOMIZE_EMBEDDED_PAGE_ERROR_BACKGROUND_URL: string = errorBackgroundEmbedded

// endregion

// region 定制键：侧栏 Logo

/**
 * 侧栏 Logo 类型配置键。
 */
export const CUSTOMIZE_KEY_SIDEBAR_LOGO_TYPE = 'sidebar_logo_type'

/**
 * 侧栏 Logo 图片节点 category 配置键。
 */
export const CUSTOMIZE_KEY_SIDEBAR_LOGO_CATEGORY = 'sidebar_logo_category'

/**
 * 侧栏 Logo 图片节点 args 配置键。
 */
export const CUSTOMIZE_KEY_SIDEBAR_LOGO_ARGS = 'sidebar_logo_args'

/**
 * 侧栏 Logo 容器背景色配置键（CSS color）。
 */
export const CUSTOMIZE_KEY_SIDEBAR_LOGO_CONTAINER_BACKGROUND = 'sidebar_logo_container_background'

/**
 * 侧栏 Logo 容器背景色未配置或无效时的默认值（与默认主题侧栏背景一致）。
 */
export const CUSTOMIZE_DEFAULT_SIDEBAR_LOGO_CONTAINER_BACKGROUND = '#2d3a4b'

// endregion

// region 类型枚举默认值

/**
 * 背景类型：内嵌默认图片。
 */
export const CUSTOMIZE_BACKGROUND_TYPE_EMBEDDED = '0'

/**
 * 背景类型：固定 settingrepo 图片节点。
 */
export const CUSTOMIZE_BACKGROUND_TYPE_FIXED_IMAGE = '1'

/**
 * 背景类型：settingrepo 图片列表节点随机轮播。
 */
export const CUSTOMIZE_BACKGROUND_TYPE_IMAGE_CAROUSEL = '2'

/**
 * 侧栏 Logo 类型：不展示。
 */
export const CUSTOMIZE_SIDEBAR_LOGO_TYPE_HIDDEN = '0'

/**
 * 侧栏 Logo 类型：静态 settingrepo 图片节点。
 */
export const CUSTOMIZE_SIDEBAR_LOGO_TYPE_STATIC_IMAGE = '1'

// endregion

// region 类型定义

/**
 * 页面背景定制配置键三元组。
 */
export type ElementPlusEngineeringCustomizeBackgroundKeys = {
  typeKey: string
  categoryKey: string
  argsKey: string
}

/**
 * 页面背景定制配置。
 */
export type ElementPlusEngineeringCustomizeBackgroundConfig = {
  type: string
  category: string
  args: string[]
}

/**
 * 侧栏 Logo 定制配置。
 */
export type ElementPlusEngineeringCustomizeSidebarLogoConfig = {
  type: string
  category: string
  args: string[]
}

/**
 * 定制配置值读取函数。
 */
export type ElementPlusEngineeringCustomizeValueReader = (key: string) => string | null

// endregion

// region 通知

/**
 * 向默认可视化器输出定制加载错误消息。
 *
 * @param message 错误消息。
 */
export function notifyElementPlusEngineeringCustomizeError(message: string): void {
  vim.ctx().library().defaultVisualizerInfo().visualizer.notify('errorMessage', message)
}

// endregion

// region 解析

/**
 * 解析定制配置中的数字枚举字符串。
 *
 * @param value 原始配置值。
 * @param allowed 允许的枚举值集合。
 * @param fallback 无法解析时的回退值。
 * @returns 合法的枚举值。
 */
export function parseCustomizeNumericEnum(
  value: string | null | undefined,
  allowed: ReadonlySet<string>,
  fallback: string,
): string {
  const normalized = (value ?? '').trim()
  if (normalized === '' || !allowed.has(normalized)) {
    return fallback
  }
  return normalized
}

/**
 * 解析定制配置中的 JSON 数组 args。
 *
 * @param value 原始配置值。
 * @returns 字符串数组；格式非法时返回 null。
 */
export function parseCustomizeArgsJson(value: string | null | undefined): string[] | null {
  const trimmed = (value ?? '').trim()
  if (trimmed === '') {
    return null
  }
  let raw: unknown
  try {
    raw = JSON.parse(trimmed) as unknown
  } catch {
    return null
  }
  if (!Array.isArray(raw)) {
    return null
  }
  const result: string[] = []
  for (const item of raw) {
    if (typeof item !== 'string') {
      return null
    }
    result.push(item)
  }
  return result
}

/**
 * 从当前定制方案读取页面背景配置。
 *
 * @param readValue 定制值读取函数。
 * @param keys 背景配置键三元组。
 * @returns 背景配置。
 */
export function readElementPlusEngineeringCustomizeBackgroundConfig(
  readValue: ElementPlusEngineeringCustomizeValueReader,
  keys: ElementPlusEngineeringCustomizeBackgroundKeys,
): ElementPlusEngineeringCustomizeBackgroundConfig {
  const type = parseCustomizeNumericEnum(
    readValue(keys.typeKey),
    new Set([
      CUSTOMIZE_BACKGROUND_TYPE_EMBEDDED,
      CUSTOMIZE_BACKGROUND_TYPE_FIXED_IMAGE,
      CUSTOMIZE_BACKGROUND_TYPE_IMAGE_CAROUSEL,
    ]),
    CUSTOMIZE_BACKGROUND_TYPE_EMBEDDED,
  )
  const category = (readValue(keys.categoryKey) ?? '').trim()
  const args = parseCustomizeArgsJson(readValue(keys.argsKey)) ?? []
  return { type, category, args }
}

/**
 * 从当前定制方案读取侧栏 Logo 配置。
 *
 * @param readValue 定制值读取函数。
 * @returns Logo 配置。
 */
export function readElementPlusEngineeringCustomizeSidebarLogoConfig(
  readValue: ElementPlusEngineeringCustomizeValueReader,
): ElementPlusEngineeringCustomizeSidebarLogoConfig {
  const type = parseCustomizeNumericEnum(
    readValue(CUSTOMIZE_KEY_SIDEBAR_LOGO_TYPE),
    new Set([CUSTOMIZE_SIDEBAR_LOGO_TYPE_HIDDEN, CUSTOMIZE_SIDEBAR_LOGO_TYPE_STATIC_IMAGE]),
    CUSTOMIZE_SIDEBAR_LOGO_TYPE_HIDDEN,
  )
  const category = (readValue(CUSTOMIZE_KEY_SIDEBAR_LOGO_CATEGORY) ?? '').trim()
  const args = parseCustomizeArgsJson(readValue(CUSTOMIZE_KEY_SIDEBAR_LOGO_ARGS)) ?? []
  return { type, category, args }
}

/**
 * 从当前定制方案读取侧栏 Logo 容器背景色。
 *
 * @param readValue 定制值读取函数。
 * @returns 可用于 CSS background-color 的颜色字符串。
 */
export function readElementPlusEngineeringCustomizeSidebarLogoContainerBackground(
  readValue: ElementPlusEngineeringCustomizeValueReader,
): string {
  const trimmed = (readValue(CUSTOMIZE_KEY_SIDEBAR_LOGO_CONTAINER_BACKGROUND) ?? '').trim()
  if (trimmed === '') {
    return CUSTOMIZE_DEFAULT_SIDEBAR_LOGO_CONTAINER_BACKGROUND
  }
  if (
    typeof CSS !== 'undefined' &&
    !CSS.supports('color', trimmed) &&
    !CSS.supports('background-color', trimmed)
  ) {
    notifyElementPlusEngineeringCustomizeError('侧栏 Logo 容器背景色配置无效')
    return CUSTOMIZE_DEFAULT_SIDEBAR_LOGO_CONTAINER_BACKGROUND
  }
  return trimmed
}

// endregion

// region 图片加载

/**
 * 校验 category 与 args 是否可用于访问 settingrepo 图片节点。
 *
 * @param category 节点 category。
 * @param args 节点 args。
 * @returns 是否有效。
 */
function isValidSettingrepoImageReference(category: string, args: readonly string[]): boolean {
  return category !== '' && args.length > 0
}

/**
 * 通过公开接口下载固定图片节点原图。
 *
 * @param category 图片节点 category，不含 public$ 前缀。
 * @param args 图片节点 args。
 * @returns 图片 Blob。
 */
async function loadPublicFixedImageBlob(category: string, args: readonly string[]): Promise<Blob> {
  const inspectResult = await resolveResponse(
    imageNodeInspectForPublic({
      category,
      args: [...args],
    }),
  )
  if (!inspectResult) {
    throw new Error('无法 inspect 固定图片节点')
  }
  const blob = await imageNodeDownloadFileForPublic({
    category,
    args: [...args],
  })
  if (!blob) {
    throw new Error('下载固定图片节点原图失败')
  }
  return blob
}

/**
 * 通过公开接口从图片列表节点随机下载一张原图。
 *
 * @param category 图片列表节点 category，不含 public$ 前缀。
 * @param args 图片列表节点 args。
 * @returns 图片 Blob。
 */
async function loadPublicCarouselImageBlob(
  category: string,
  args: readonly string[],
): Promise<Blob> {
  const sizeResult = await resolveResponse(
    imageListNodeSizeForPublic({
      category,
      args: [...args],
    }),
  )
  if (!sizeResult || sizeResult.size <= 0) {
    throw new Error('图片列表节点为空')
  }
  const inspectResult = await resolveResponse(
    imageListNodeInspectForPublic({
      category,
      args: [...args],
    }),
  )
  if (!inspectResult) {
    throw new Error('无法 inspect 图片列表节点')
  }
  const index = Math.floor(Math.random() * sizeResult.size)
  const item = inspectResult.items[index]
  if (!item || item.null_flag) {
    throw new Error(`图片列表节点索引 ${index} 未设置图片`)
  }
  const blob = await imageListNodeDownloadFileForPublic({
    category,
    args: [...args],
    index,
  })
  if (!blob) {
    throw new Error('下载图片列表节点原图失败')
  }
  return blob
}

/**
 * 根据背景配置解析可展示的 object URL。
 *
 * 配置错误或加载失败时会 notify 并回退到内嵌默认图 URL（非 object URL）。
 *
 * @param config 背景配置。
 * @param embeddedDefaultUrl 内嵌默认图 URL。
 * @returns CSS background-image 可用的 url 字符串内容（不含 url() 包装）。
 */
export async function resolveElementPlusEngineeringCustomizeBackgroundUrl(
  config: ElementPlusEngineeringCustomizeBackgroundConfig,
  embeddedDefaultUrl: string,
): Promise<string> {
  if (config.type === CUSTOMIZE_BACKGROUND_TYPE_EMBEDDED) {
    return embeddedDefaultUrl
  }

  if (!isValidSettingrepoImageReference(config.category, config.args)) {
    notifyElementPlusEngineeringCustomizeError('背景定制缺少 category 或 args')
    return embeddedDefaultUrl
  }

  try {
    if (config.type === CUSTOMIZE_BACKGROUND_TYPE_FIXED_IMAGE) {
      const listInspect = await resolveResponse(
        imageListNodeInspectForPublic({
          category: config.category,
          args: [...config.args],
        }),
      )
      if (listInspect) {
        notifyElementPlusEngineeringCustomizeError('背景类型为固定图片，但节点是图片列表')
        return embeddedDefaultUrl
      }
      const blob = await loadPublicFixedImageBlob(config.category, config.args)
      return window.URL.createObjectURL(blob)
    }

    if (config.type === CUSTOMIZE_BACKGROUND_TYPE_IMAGE_CAROUSEL) {
      const imageInspect = await resolveResponse(
        imageNodeInspectForPublic({
          category: config.category,
          args: [...config.args],
        }),
      )
      if (imageInspect) {
        notifyElementPlusEngineeringCustomizeError('背景类型为随机轮播，但节点是固定图片')
        return embeddedDefaultUrl
      }
      const blob = await loadPublicCarouselImageBlob(config.category, config.args)
      return window.URL.createObjectURL(blob)
    }

    notifyElementPlusEngineeringCustomizeError(`未知的背景类型: ${config.type}`)
    return embeddedDefaultUrl
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    notifyElementPlusEngineeringCustomizeError('加载定制背景失败')
    notifyElementPlusEngineeringCustomizeError(message)
    return embeddedDefaultUrl
  }
}

/**
 * 根据侧栏 Logo 配置解析 object URL。
 *
 * @param config Logo 配置。
 * @returns object URL；不展示或失败时返回 null。
 */
export async function resolveElementPlusEngineeringCustomizeSidebarLogoUrl(
  config: ElementPlusEngineeringCustomizeSidebarLogoConfig,
): Promise<string | null> {
  if (config.type === CUSTOMIZE_SIDEBAR_LOGO_TYPE_HIDDEN) {
    return null
  }

  if (!isValidSettingrepoImageReference(config.category, config.args)) {
    notifyElementPlusEngineeringCustomizeError('侧栏 Logo 定制缺少 category 或 args')
    return null
  }

  try {
    const listInspect = await resolveResponse(
      imageListNodeInspectForPublic({
        category: config.category,
        args: [...config.args],
      }),
    )
    if (listInspect) {
      notifyElementPlusEngineeringCustomizeError('侧栏 Logo 类型为静态图片，但节点是图片列表')
      return null
    }
    const blob = await loadPublicFixedImageBlob(config.category, config.args)
    return window.URL.createObjectURL(blob)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    notifyElementPlusEngineeringCustomizeError('加载侧栏 Logo 失败')
    notifyElementPlusEngineeringCustomizeError(message)
    return null
  }
}

/**
 * 释放由定制图片加载创建的 object URL。
 *
 * @param url 待释放的 URL。
 */
export function revokeElementPlusEngineeringCustomizeObjectUrl(
  url: string | null | undefined,
): void {
  if (!url || !url.startsWith('blob:')) {
    return
  }
  window.URL.revokeObjectURL(url)
}

// endregion

// region 背景图片预加载

/**
 * 预加载背景图片 URL，确保浏览器解码完成后再展示，避免默认图与定制图切换闪烁。
 *
 * @param url 图片 URL，含内嵌资源路径或 blob URL。
 * @returns 加载完成后结束的 Promise。
 */
export function preloadElementPlusEngineeringBackgroundImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = (): void => {
      resolve()
    }
    image.onerror = (): void => {
      reject(new Error('背景图片预加载失败'))
    }
    image.src = url
  })
}

// endregion

// region 响应式背景尺寸

/**
 * 按视口宽高比更新背景 style 的 backgroundSize。
 *
 * @param style 背景 style 对象。
 */
export function applyElementPlusEngineeringResponsiveBackgroundSize(style: {
  backgroundSize: string
}): void {
  if (document.documentElement.clientWidth < document.documentElement.clientHeight) {
    style.backgroundSize = 'auto 100%'
  } else {
    style.backgroundSize = '100% auto'
  }
}

/**
 * 注册窗口 resize 回调以维持背景 backgroundSize。
 *
 * @param style 背景 style 对象。
 * @returns 供 onBeforeUnmount 恢复的清理函数。
 */
export function registerElementPlusEngineeringResponsiveBackgroundResize(style: {
  backgroundSize: string
}): () => void {
  const handler = (): void => {
    applyElementPlusEngineeringResponsiveBackgroundSize(style)
  }
  window.addEventListener('resize', handler)
  return () => {
    window.removeEventListener('resize', handler)
  }
}

// endregion
