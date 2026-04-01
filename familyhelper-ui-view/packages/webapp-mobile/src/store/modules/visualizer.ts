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
}

export type Modal = {
  visualizerKey: string
  visualizer: Visualizer
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
  })
}

// endregion

// region 钩子逻辑

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
    // 获取 Visualizer Key。
    const key: string = await loadVisualizerKey0()
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

// 配置仓库类型。
const SETTINGREPO_CATEGORY: string = 'framework.mobile.visualizer'
// 配置仓库参数: key。
const SETTINGREPO_ARGS_KEY: string[] = ['key']

async function loadVisualizerKey0(): Promise<string> {
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
  return toKebabCase(result.value ?? '')
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
