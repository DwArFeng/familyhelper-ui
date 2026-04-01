// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import { type StoreSetup, type VimStoreModule } from '@/store/types.ts'

import { computed, type ComputedRef, ref } from 'vue'

import { type TextNodeInspectResult } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { operateInspectForPublic as textNodeOperateInspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'
import { type Visualizer } from '@/library/types.ts'
import vim from '@/vim'

// region 初始化逻辑

/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerVimInitializedHook(vimInitializedLoadHook)
  ctx.registerWindowLoadHook(windowLoadHook)
}

// endregion

// region Store 定义

/**
 * Visualizer Key Store。
 */
export type VisualizerStore = {
  ready: ComputedRef<boolean>
  visualizerKey: ComputedRef<string>
  visualizer: ComputedRef<Visualizer>
  getModalOverrideInfo: () => ModalOverrideInfo | null
  setModalOverrideInfo: (modalOverrideInfo: ModalOverrideInfo) => void
}

export type Modal = {
  visualizerKey: string
  visualizer: Visualizer
}

export type ModalOverrideInfo = {
  visualizerKey: string
  override: boolean
}

// Store 区域。
const _ready = ref<boolean>(false)

const ready: ComputedRef<boolean> = computed(() => _ready.value)

function setReady(): void {
  _ready.value = true
}

// 模态。
const _modal = ref<Modal | null>(null)

const visualizerKey: ComputedRef<string> = computed(() => {
  if (!_modal.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return _modal.value.visualizerKey
})

const visualizer: ComputedRef<Visualizer> = computed(() => {
  if (!_modal.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return _modal.value.visualizer
})

function updateModal(visualizerKey: string | null): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (!visualizerKey) {
    _modal.value = {
      visualizerKey: ctx.library().setting.defaultVisualizerKey,
      visualizer: ctx.library().defaultVisualizer(),
    }
  } else {
    const visualizer: Visualizer | null = vim.ctx().library().visualizer(visualizerKey)
    if (!visualizer) {
      _modal.value = {
        visualizerKey: ctx.library().setting.defaultVisualizerKey,
        visualizer: ctx.library().defaultVisualizer(),
      }
    } else {
      _modal.value = {
        visualizerKey,
        visualizer,
      }
    }
  }
}

// 模态覆盖信息。
function getModalOverrideInfo(): ModalOverrideInfo | null {
  const modalOverrideInfoJson = localStorage.getItem(
    VISUALIZER_LOCAL_STORAGE_MODAL_OVERRIDE_INFO_KEY,
  )
  if (modalOverrideInfoJson === null || modalOverrideInfoJson === undefined) {
    return null
  }

  try {
    // 从 JSON 中反序列化得到的对象不可靠，应先校验结构。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modalOverrideInfo: any = JSON.parse(modalOverrideInfoJson)
    if (!modalOverrideInfo || typeof modalOverrideInfo !== 'object') {
      return null
    }
    if (typeof modalOverrideInfo.override !== 'boolean') {
      return null
    }
    if (!modalOverrideInfo.override) {
      return null
    }
    return modalOverrideInfo as ModalOverrideInfo
  } catch {
    return null
  }
}

function setModalOverrideInfo(modalOverrideInfo: ModalOverrideInfo): void {
  try {
    window.localStorage.setItem(
      VISUALIZER_LOCAL_STORAGE_MODAL_OVERRIDE_INFO_KEY,
      JSON.stringify({
        visualizerKey: modalOverrideInfo.visualizerKey,
        override: modalOverrideInfo.override,
      }),
    )
  } catch {
    window.localStorage.removeItem(VISUALIZER_LOCAL_STORAGE_MODAL_OVERRIDE_INFO_KEY)
  }
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): VisualizerStore => ({
    ready,
    visualizerKey,
    visualizer,
    getModalOverrideInfo,
    setModalOverrideInfo,
  })
}

// endregion

// region 钩子逻辑

// Visualizer 模态覆盖信息本地存储键。
const VISUALIZER_LOCAL_STORAGE_MODAL_OVERRIDE_INFO_KEY = 'store.modal_override_info.visualizer'
// 配置仓库类型。
const SETTINGREPO_CATEGORY: string = 'framework.mobile.visualizer'
// 配置仓库参数: key。
const SETTINGREPO_ARGS_KEY: string[] = ['key']

/**
 * VIM 初始化钩子。
 */
function vimInitializedLoadHook(): void {
  // 初始化模态。
  initModal()
}

function initModal(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  updateModal(null)
}

/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  // 加载 visualizer key。
  loadModal().then(() => {})
}

/**
 * 加载 Visualizer Key。
 */
async function loadModal(): Promise<void> {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  try {
    // 优先尝试从本地覆盖信息中读取 Visualizer Key。
    const key: string =
      loadVisualizerKeyFromLocalStorage() ?? (await loadVisualizerKeyFromSettingrepo())
    // 更新模态。
    updateModal(key)
  } catch (e: unknown) {
    // 输出错误信息。
    ctx.library().defaultVisualizer().notify('errorMessage', '加载 Visualizer Key 失败')
    let message: string
    if (e instanceof Error) {
      message = e.message
    } else {
      message = '未知错误'
    }
    ctx.library().defaultVisualizer().notify('errorMessage', message)
    // 更新模态。
    updateModal(null)
  } finally {
    // 设置准备标记。
    setReady()
  }
}

function loadVisualizerKeyFromLocalStorage(): string | null {
  const modalOverrideInfoJson = localStorage.getItem(
    VISUALIZER_LOCAL_STORAGE_MODAL_OVERRIDE_INFO_KEY,
  )
  if (modalOverrideInfoJson === null || modalOverrideInfoJson === undefined) {
    return null
  }

  try {
    // 从 JSON 中反序列化得到的对象不可靠，应先校验结构。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modalOverrideInfo: any = JSON.parse(modalOverrideInfoJson)
    if (!modalOverrideInfo || typeof modalOverrideInfo !== 'object') {
      return null
    }
    if (typeof modalOverrideInfo.override !== 'boolean') {
      return null
    }
    if (!modalOverrideInfo.override) {
      return null
    }
    validateVisualizerKey(modalOverrideInfo.visualizerKey)
    return modalOverrideInfo.visualizerKey as string
  } catch {
    return null
  }
}

async function loadVisualizerKeyFromSettingrepo(): Promise<string> {
  // 获取 Visualizer Key。
  const result: TextNodeInspectResult | null = (await resolveResponse(
    textNodeOperateInspect({
      category: SETTINGREPO_CATEGORY,
      args: SETTINGREPO_ARGS_KEY,
    }),
  )) as TextNodeInspectResult | null
  if (!result) {
    throw new Error('无法获取 Visualizer Key, 请联系开发人员')
  }
  const visualizerKey = toKebabCase(result.value ?? '')
  validateVisualizerKey(visualizerKey)
  return visualizerKey
}

// 该方法用于验证 VisualizerKey 的格式，接受任何类型的参数，故忽略类型警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateVisualizerKey(obj: any): void {
  if (typeof obj !== 'string') {
    throw new Error('VisualizerKey 格式不正确')
  }
}

// endregion

// region VimStoreModule 定义

/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup,
}

// endregion

export default vimStoreModule
