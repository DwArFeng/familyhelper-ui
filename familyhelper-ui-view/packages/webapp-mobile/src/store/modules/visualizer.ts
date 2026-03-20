// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import { type StoreSetup, type VimStoreModule } from '@/store/types.ts'

import { computed, type ComputedRef, ref } from 'vue'

import { type TextNodeInspectResult } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { operateInspectForPublic as textNodeOperateInspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerWindowLoadHook(windowLoadHook)
}

// -----------------------------------------------------------Store 定义-----------------------------------------------------------
/**
 * Visualizer Key Store。
 */
export type VisualizerStore = {
  ready: ComputedRef<boolean>
  visualizerKey: ComputedRef<string | null>
}

// Store 区域。
const _ready = ref<boolean>(false)
const _visualizerKey = ref<string | null>(null)

// Visualizer Key。
const ready: ComputedRef<boolean> = computed(() => _ready.value)
const visualizerKey: ComputedRef<string | null> = computed(() => _visualizerKey.value)

function setReady(value: boolean): void {
  _ready.value = value
}

function setVisualizerKey(value: string | null): void {
  _visualizerKey.value = value
}

/**
 * 加载 Visualizer Key。
 */
async function loadVisualizerKey(): Promise<void> {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  try {
    // 获取 Visualizer Key。
    const key: string = await loadVisualizerKey0()

    // 设置 Visualizer Key。
    setVisualizerKey(key)
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

    // 使用默认 Visualizer Key。
    setVisualizerKey(null)
  } finally {
    // 设置准备标记。
    setReady(true)
  }
}

/**
 * 配置仓库的设置类别: ID。
 */
const SETTINGREPO_CATEGORY: string = 'visualizer_key.mobile'
/**
 * 配置仓库的参数: Key。
 */
const SETTINGREPO_ARGS_KEY: string[] = ['visualizer.key']

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
  return toKebabCase(result.value)
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
  })
}

// -----------------------------------------------------------钩子逻辑-----------------------------------------------------------
/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  // 加载 visualizer key。
  loadVisualizerKey().then(() => {})
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
