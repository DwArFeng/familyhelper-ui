// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import { type StoreSetup, type VimStoreModule } from '@/store/types.ts'

import { type ComputedRef } from 'vue'
import { computed, ref } from 'vue'

import { type TextNode } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { operateInspectForPublic as textNodeOperateInspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { type ImageNode } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageNode.ts'
import {
  inspectForPublic as imageNodeInspect,
  downloadFileForPublic as imageNodeDownloadFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageNode.ts'
import {
  type ImageListNodeSizeResult,
  type ImageListNodeInspectResult,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageListNode.ts'
import {
  sizeForPublic as imageListSize,
  inspectForPublic as imageListInspect,
  downloadFileForPublic as imageListDownloadFile,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/imageListNode.ts'

import { resolveResponse } from '@/util/response.ts'

import loginBackgroundImg from '@/assets/img/login-background.jpg'

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerWindowLoadHook(windowLoadHook)
  ctx.registerWindowBeforeUnloadHook(windowBeforeUnloadHook)
}

// -----------------------------------------------------------Store 定义-----------------------------------------------------------
/**
 * Login Background Store。
 */
export type LoginBackgroundStore = {
  ready: ComputedRef<boolean>
  backgroundUrl: ComputedRef<string | null>
}

// Store 区域。
const _backgroundBlob = ref<Blob | null>(null)
const _backgroundUrl = ref<string | null>(null)
const _isImageReady = ref<boolean>(false)

// 准备标记。
const ready: ComputedRef<boolean> = computed(() => _isImageReady.value)

function setReady(value: boolean): void {
  _isImageReady.value = value
}

// 背景图片。
const backgroundUrl: ComputedRef<string | null> = computed(() => _backgroundUrl.value)

function setBackgroundBlob(value: Blob | null): void {
  _backgroundBlob.value = value
}

function setBackgroundUrl(value: string | null): void {
  _backgroundUrl.value = value
}

/**
 * 加载背景图片。
 */
async function loadBackground(): Promise<void> {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  try {
    // 复位准备完毕标记。
    setReady(false)

    // 如果已经有背景图片 BLOB，则释放之前的对象 URL。
    if (_backgroundUrl.value) {
      window.URL.revokeObjectURL(_backgroundUrl.value)
    }

    // 获取图片 BLOB。
    const blob: Blob = await loadBackground0()
    // 创建对象 URL。
    const url: string = window.URL.createObjectURL(blob)

    // 设置背景图片 Blob 以及 对象 URL。
    setBackgroundBlob(blob)
    setBackgroundUrl(url)

    // 置位准备完毕标记。
    setReady(true)
  } catch (e: unknown) {
    // 输出错误信息。
    ctx.library().defaultVisualizer().notify('errorMessage', '加载登录背景图片失败')
    let message: string
    if (e instanceof Error) {
      message = e.message
    } else {
      message = '未知错误'
    }
    ctx.library().defaultVisualizer().notify('errorMessage', message)

    // 如果已经有背景图片 BLOB，则释放之前的对象 URL。
    if (_backgroundUrl.value) {
      window.URL.revokeObjectURL(_backgroundUrl.value)
    }

    // 使用默认登录背景作为 URL。
    setBackgroundBlob(null)
    setBackgroundUrl(loginBackgroundImg)
    setReady(true)
  }
}

/**
 * 配置仓库的设置类别: ID。
 */
const SETTINGREPO_CATEGORY: string = 'login_background.pc'
/**
 * 配置仓库的参数: 类型。
 */
const SETTINGREPO_ARGS_TYPE: string[] = ['type']
/**
 * 配置仓库的参数: 图片。
 */
const SETTINGREPO_ARGS_IMAGE: string[] = ['image']
/**
 * 配置仓库的参数: 图片列表。
 */
const ARGS_IMAGE_LIST: string[] = ['image_list']

const TYPE_IMAGE: string = '0'
const TYPE_IMAGE_LIST: string = '1'

async function loadBackground0(): Promise<Blob> {
  // 获取登录背景图片的类型。
  const typeTextNode: TextNode | null = (await resolveResponse(
    textNodeOperateInspect({
      category: SETTINGREPO_CATEGORY,
      args: SETTINGREPO_ARGS_TYPE,
    }),
  )) as TextNode | null
  if (!typeTextNode) {
    throw new Error('无法获取登录背景图片类型, 请联系开发人员')
  }
  const type: string = typeTextNode.value
  // 根据类型加载背景图片。
  switch (type) {
    case TYPE_IMAGE: {
      // 加载背景图片。
      return await loadBackgroundByImage()
    }
    case TYPE_IMAGE_LIST: {
      // 加载背景图片列表。
      return await loadBackgroundByImageList()
    }
    default: {
      throw new Error(`未知的登录背景图片类型: ${type}`)
    }
  }
}

async function loadBackgroundByImage(): Promise<Blob> {
  // 获取登录背景图片的信息。
  const imageNode: ImageNode | null = (await resolveResponse(
    imageNodeInspect({
      category: SETTINGREPO_CATEGORY,
      args: SETTINGREPO_ARGS_IMAGE,
    }),
  )) as ImageNode | null
  if (!imageNode) {
    throw new Error('无法获取登录背景图片, 请联系开发人员')
  }
  // 下载背景图片并返回。
  const result: Blob | null = await imageNodeDownloadFile({
    category: SETTINGREPO_CATEGORY,
    args: SETTINGREPO_ARGS_IMAGE,
  })
  if (!result) {
    throw new Error('下载登录背景图片失败')
  }
  return result
}

async function loadBackgroundByImageList(): Promise<Blob> {
  // 获取登录背景图片列表的大小信息。
  const sizeResult: ImageListNodeSizeResult | null = await resolveResponse(
    imageListSize({
      category: SETTINGREPO_CATEGORY,
      args: ARGS_IMAGE_LIST,
    }),
  )
  if (!sizeResult) {
    throw new Error('无法获取登录背景图片列表的大小信息, 请联系开发人员')
  }
  // 随机选择一个索引。
  const index: number = Math.floor(Math.random() * sizeResult.size)
  // 获取登录背景图片列表的图片信息。
  const imageListNodeInspectResult: ImageListNodeInspectResult | null = (await resolveResponse(
    imageListInspect({
      category: SETTINGREPO_CATEGORY,
      args: ARGS_IMAGE_LIST,
    }),
  )) as ImageListNodeInspectResult | null
  if (!imageListNodeInspectResult) {
    throw new Error('无法获取登录背景图片列表, 请联系开发人员')
  }
  if (imageListNodeInspectResult.items[index].null_flag) {
    throw new Error(`登录背景图片列表中索引为 ${index} 的图片未设置, 请联系开发人员`)
  }
  // 下载背景图片并返回。
  const result: Blob | null = await imageListDownloadFile({
    category: SETTINGREPO_CATEGORY,
    args: ARGS_IMAGE_LIST,
    index,
  })
  if (!result) {
    throw new Error('下载登录背景图片失败')
  }
  return result
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): LoginBackgroundStore => ({
    ready,
    backgroundUrl,
  })
}

// -----------------------------------------------------------钩子逻辑-----------------------------------------------------------
/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  // 加载背景图片。
  loadBackground().then(() => {})
}

/**
 * Window 卸载钩子。
 */
function windowBeforeUnloadHook(): void {
  // 释放对象 URL，避免内存泄漏。
  if (_backgroundUrl.value) {
    window.URL.revokeObjectURL(_backgroundUrl.value)
  }

  // 重置状态。
  setReady(false)
  setBackgroundBlob(null)
  setBackgroundUrl(null)
}

// -----------------------------------------------------------VimStoreModule 定义-----------------------------------------------------------
/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup,
}

export default vimStoreModule
